import { useRef, useState, useEffect } from 'react';
import Picker from '@emoji-mart/react';
import cn from 'classnames';

import Header from './components/Header';
import Messages from './components/Messages';
import Sender from './components/Sender';
import QuickButtons from './components/QuickButtons';

import { AnyFunction } from '../../../../utils/types';

import './style.scss';

declare namespace Intl {
  export interface Segmenter {
    segment(value: string): any
  }
  const Segmenter: {
    new(
        locales?: any,
        options?: any,
    ): Segmenter;
  };
}

interface ISenderRef {
  onSelectEmoji: (event: any) => void;
}

type Props = {
  title: string;
  subtitle: string;
  senderPlaceHolder: string;
  showCloseButton: boolean;
  disabledInput: boolean;
  vanishInput: boolean;
  autofocus: boolean;
  className: string;
  sendMessage: AnyFunction;
  toggleChat: AnyFunction;
  profileAvatar?: string;
  profileClientAvatar?: string;
  titleAvatar?: string;
  onQuickButtonClicked?: AnyFunction;
  onTextInputChange?: (event: any) => void;
  sendButtonAlt: string;
  showTimeStamp: boolean;
  resizable?: boolean;
  emojis?: boolean;
  emojiFetchData?: string;
  emojiTheme?: string;
  onFileInputClick?: (event: any) => void;
  onFileInputChange?: (event: any) => void;
};

function Conversation({
  title,
  subtitle,
  senderPlaceHolder,
  showCloseButton,
  disabledInput,
  vanishInput,
  autofocus,
  className,
  sendMessage,
  toggleChat,
  profileAvatar,
  profileClientAvatar,
  titleAvatar,
  onQuickButtonClicked,
  onTextInputChange,
  sendButtonAlt,
  showTimeStamp,
  resizable,
  emojis,
  emojiFetchData,
  emojiTheme,
  onFileInputClick,
  onFileInputChange
}: Props) {
  const [containerDiv, setContainerDiv] = useState<HTMLElement | null>();
  let startX, startWidth;

  useEffect(() => {
    const containerDiv = document.getElementById('rcw-conversation-container');
    setContainerDiv(containerDiv);
  }, []);

  const initResize = (e) => {
    if (resizable) {
      startX = e.clientX;
      if (document.defaultView && containerDiv){
        startWidth = parseInt(document.defaultView.getComputedStyle(containerDiv).width);
        window.addEventListener('mousemove', resize, false);
        window.addEventListener('mouseup', stopResize, false);
      }
    }
  }

  const resize = (e) => {
    if (containerDiv) {
      containerDiv.style.width = (startWidth - e.clientX + startX) + 'px';
    }
  }

  const stopResize = (e) => {
    window.removeEventListener('mousemove', resize, false);
    window.removeEventListener('mouseup', stopResize, false);
  }
  
  const [pickerOffset, setOffset] = useState(0)
  const senderRef = useRef<ISenderRef>(null!);
  const [pickerStatus, setPicket] = useState(false) 
 
  const onSelectEmoji = (emoji) => {
    senderRef.current?.onSelectEmoji(emoji)
  }

  const togglePicker = () => {
    setPicket(prevPickerStatus => !prevPickerStatus)
  }

  const handlerSendMsn = (event) => {
    // Quando for apenas um emoji na mensagem, vamos suar o # do markdown para deixa-lo grande rs
    if(typeof event == 'string'){
      let textLength = [...(new Intl.Segmenter()).segment(event)].length;
      let isEmoji = /\p{Extended_Pictographic}/u.test(event);
      if(textLength == 1 && isEmoji){
        event = `# ${event}`;
      }
    }
    sendMessage(event);
    if(pickerStatus) setPicket(false)
  }

  const [emojiData, setEmojiData] = useState(null);
  useEffect(() => {
    if(emojiFetchData){
      fetch(emojiFetchData)
        .then(res => res.json())
        .then(data => setEmojiData(data))
      .catch(err => console.error("Fail on fetch emoji data", err));
    }
  }, []);


  return (
    <div id="rcw-conversation-container" onMouseDown={initResize} 
      className={cn('rcw-conversation-container', className)} aria-live="polite">
      {resizable && <div className="rcw-conversation-resizer" />}
      <Header
        title={title}
        subtitle={subtitle}
        toggleChat={toggleChat}
        showCloseButton={showCloseButton}
        titleAvatar={titleAvatar}
      />
      <Messages
        profileAvatar={profileAvatar}
        profileClientAvatar={profileClientAvatar}
        showTimeStamp={showTimeStamp}
      />
      <QuickButtons onQuickButtonClicked={onQuickButtonClicked} />
      {emojis && pickerStatus && emojiData && (<div
        style={{ position: 'absolute', bottom: pickerOffset, left: 0, width: '100%' }}
      ><Picker 
        data={emojiData}
        onEmojiSelect={onSelectEmoji}
        set='native'
        locale='pt'
        theme={emojiTheme}
        previewPosition='none'
        searchPosition='none'
        maxFrequentRows={0}
        dynamicWidth={true}
      /></div>)}
      <Sender
        ref={senderRef}
        sendMessage={handlerSendMsn}
        placeholder={senderPlaceHolder}
        disabledInput={disabledInput}
        vanishInput={vanishInput}
        autofocus={autofocus}
        onTextInputChange={onTextInputChange}
        buttonAlt={sendButtonAlt}
        onPressEmoji={togglePicker}
        onChangeSize={setOffset}
        onFileInputClick={onFileInputClick}
        onFileInputChange={onFileInputChange}
      />
    </div>
  );
}

export default Conversation;
