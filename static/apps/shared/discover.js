/* shared/discover.js
   정적 사이트에서 "폴더에 파일만 추가하면 자동 인식"을 가능하게 해주는 도우미.
   - GitHub Pages: 저장소 파일 트리를 읽어 실시간 반영
   - 그 외(로컬 서버 등): 각 페이지가 manifest/registry 파일로 폴백
   사용: const files = await listFiles("sounds");  // 현재 페이지 기준 하위 경로 배열 또는 null
*/
(function (global) {
  function safeDecode(s){ try { return decodeURIComponent(s); } catch (e) { return s; } }

  // 현재 URL에서 가능한 (owner, repo, base) 후보들을 만든다.
  // base = 현재 페이지 디렉터리의 저장소 기준 경로(앞뒤 슬래시 없음, 루트면 "")
  function candidates(){
    const host = location.hostname;
    if (!host.endsWith(".github.io")) return [];
    const owner = host.replace(".github.io", "");
    const segs = location.pathname.replace(/index\.html$/, "").split("/").filter(Boolean);
    const out = [];
    if (segs.length) {
      // 프로젝트 페이지: /<repo>/...  → repo=segs[0], base=나머지
      out.push({ owner, repo: segs[0], base: segs.slice(1).join("/") });
    }
    // 사용자/조직 페이지: owner.github.io 저장소가 루트로 서빙됨 → base=전체 segs
    out.push({ owner, repo: owner + ".github.io", base: segs.join("/") });
    return out;
  }

  let _treeInfo; // Promise<{tree, base} | null>
  function getTreeInfo(){
    if (_treeInfo !== undefined) return _treeInfo;
    _treeInfo = (async () => {
      for (const c of candidates()) {
        for (const branch of ["main", "master"]) {
          try {
            const r = await fetch(
              "https://api.github.com/repos/" + c.owner + "/" + c.repo +
              "/git/trees/" + branch + "?recursive=1"
            );
            if (!r.ok) continue;
            const j = await r.json();
            if (j && Array.isArray(j.tree) && j.tree.length) return { tree: j.tree, base: c.base };
          } catch (e) { /* 다음 후보 */ }
        }
      }
      return null;
    })();
    return _treeInfo;
  }

  // 현재 페이지 기준 localDir 하위의 파일 경로 목록(상대 경로) 또는 null
  async function listFiles(localDir){
    const info = await getTreeInfo();
    if (!info) return null;
    const dir = localDir.replace(/^\/+|\/+$/g, "");
    const prefix = (info.base ? info.base + "/" : "") + (dir ? dir + "/" : "");
    const out = [];
    for (const n of info.tree) {
      if (n.type !== "blob") continue;
      if (prefix && !n.path.startsWith(prefix)) continue;
      out.push(safeDecode(n.path.slice(prefix.length)));
    }
    return out;
  }

  global.Discover = { listFiles, safeDecode };
})(window);
