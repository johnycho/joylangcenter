#!/usr/bin/env python3
# static/apps 폴더 구성을 registry.json / manifest.json 에 반영한다.
#   python3 static/apps/tools/build.py
# (push 시 .github/workflows/apps-build.yml 이 같은 일을 자동으로 한다.)
#
# 플랫 구조: 개별 앱 폴더가 apps/ 바로 아래에 위치한다. (apps/sound, apps/qr ...)
# - system.json 또는 index.html 이 있는 폴더만 앱으로 등록 (shared/tools 는 자동 제외)
# - sounds/ 하위 폴더가 있으면 그 안의 mp3 로 manifest.json 생성
import os, json, unicodedata

def nfc(s):
    return unicodedata.normalize("NFC", s)

root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # .../static/apps
SKIP = {"shared", "tools", "assets"}
registry = []

for name in sorted(os.listdir(root)):
    d = os.path.join(root, name)
    if not os.path.isdir(d) or name in SKIP or name.startswith("."):
        continue
    if os.path.isfile(os.path.join(d, "system.json")) or os.path.isfile(os.path.join(d, "index.html")):
        registry.append(nfc(name))
    sounds = os.path.join(d, "sounds")
    if os.path.isdir(sounds):
        out = {}
        for cat in sorted(os.listdir(sounds)):
            cd = os.path.join(sounds, cat)
            if not os.path.isdir(cd):
                continue
            files = sorted(f for f in os.listdir(cd) if f.lower().endswith(".mp3"))
            if files:
                out[nfc(cat)] = [nfc(f) for f in files]
        with open(os.path.join(sounds, "manifest.json"), "w", encoding="utf-8") as fp:
            json.dump(out, fp, ensure_ascii=False, indent=2)

with open(os.path.join(root, "registry.json"), "w", encoding="utf-8") as fp:
    json.dump(registry, fp, ensure_ascii=False, indent=2)
print("updated:", registry)
