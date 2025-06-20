import React, {useEffect, useRef} from 'react';
import GDemo from '@glorious/demo';
import '@glorious/demo/dist/gdemo.min.css';

// Props 타입 정의
interface GloriousTerminalProps {
  code: string;
  command: string;
  response: string;
  editorTitle?: string;
  commandDelay?: number;
  responseDelay?: number;
}

const GloriousTerminal: React.FC<GloriousTerminalProps> = ({
                                                         code,
                                                         command,
                                                         response,
                                                         editorTitle = 'demo.js',
                                                         commandDelay = 1500,
                                                         responseDelay = 500,
                                                       }) => {
  const demoRef = useRef<HTMLDivElement>(null);
  const demoId = 'glorious-demo'; // ✅ 터미널 요소에 부여할 ID

  useEffect(() => {
    const element = document.getElementById(demoId);
    if (!element) return;

    element.innerHTML = ''; // ✅ 기존 요소 초기화

    const demo = new GDemo(`#${demoId}`);

    demo
    .openApp('editor', {minHeight: '350px', windowTitle: editorTitle})
    .write(code, {onCompleteDelay: commandDelay}) // ✅ 코드 입력 후 딜레이
    .openApp('terminal', {minHeight: '350px', promptString: '$'})
    .command(command, {onCompleteDelay: responseDelay}) // ✅ 명령 실행 후 딜레이
    .respond(response)
    .command('')
    .end();
  }, [code, command, response, editorTitle, commandDelay, responseDelay]);

  return (
      <div id={demoId}
           ref={demoRef}
           style={{
             maxWidth: '600px',
             margin: 'auto',
             minHeight: '200px',
           }}/>
  );
};

export default GloriousTerminal;