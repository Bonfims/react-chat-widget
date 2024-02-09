import { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { useSelector } from 'react-redux';
import cn from 'classnames';

import { GlobalState } from 'src/store/types';

import { getCaretIndex, isFirefox, updateCaret, insertNodeAtCaret, getSelection } from '../../../../../../utils/contentEditable'
const send = require('../../../../../../../assets/send_button.svg') as string;
const emoji = require('../../../../../../../assets/icon-smiley.svg') as string;
const attachment = require('../../../../../../../assets/icon-attachment.svg') as string;
const brRegex = /<br>/g;

import './style.scss';

type Props = {
  placeholder: string;
  disabledInput: boolean;
  vanishInput: boolean;
  autofocus: boolean;
  sendMessage: (event: any) => void;
  buttonAlt: string;
  onPressEmoji: () => void;
  onChangeSize: (event: any) => void;
  onTextInputChange?: (event: any) => void;

  onFileInputClick?: (event: any) => void;
  onFileInputChange?: (event: any) => void;
}

function Sender({ sendMessage, placeholder, disabledInput, vanishInput, autofocus, onTextInputChange, buttonAlt, onPressEmoji, onChangeSize, onFileInputClick, onFileInputChange }: Props, ref) {
  const showChat = useSelector((state: GlobalState) => state.behavior.showChat);
  const inputRef = useRef<HTMLDivElement>(null!);
  const refContainer = useRef<HTMLDivElement>(null);
  const [enter, setEnter]= useState(false)
  const [firefox, setFirefox] = useState(false);
  const [height, setHeight] = useState(0)
  // @ts-ignore
  useEffect(() => { if (showChat && autofocus) inputRef.current?.focus(); }, [showChat]);
  useEffect(() => { setFirefox(isFirefox())}, [])

  useImperativeHandle(ref, () => {
    return {
      onSelectEmoji: handlerOnSelectEmoji,
      toEmptyInput
    };
  });

  const handlerOnChange = (event) => {
    onTextInputChange && onTextInputChange(event)
  }

  const toEmptyInput = () => {
    const el = inputRef.current;
    if(el.innerHTML) {
      el.innerHTML = ''
    }
  };

  const handlerSendMessage = () => {
    if(vanishInput || disabledInput)
      return;
    const el = inputRef.current;
    if(el.innerHTML) {
      sendMessage(el.innerText);
      el.innerHTML = ''
    }
  }

  const handlerOnSelectEmoji = (emoji) => {
    const el = inputRef.current;
    const { start, end } = getSelection(el)
    if(el.innerHTML) {
      const firstPart = el.innerHTML.substring(0, start);
      const secondPart = el.innerHTML.substring(end);
      el.innerHTML = (`${firstPart}${emoji.native}${secondPart}`)
    } else {
      el.innerHTML = emoji.native
    }
    updateCaret(el, start, emoji.native.length)
  }

  const handlerOnKeyPress = (event) => {
    const el = inputRef.current;

    if(event.charCode == 13 && !event.shiftKey) {
      event.preventDefault()
      handlerSendMessage();
    }
    if(event.charCode === 13 && event.shiftKey) {
      event.preventDefault()
      insertNodeAtCaret(el);
      setEnter(true)
    }
  }

  // TODO use a context for checkSize and toggle picker
  const checkSize = () => {
    const senderEl = refContainer.current
    if(senderEl && height !== senderEl.clientHeight) {
      const {clientHeight} = senderEl;
      setHeight(clientHeight)
      onChangeSize(clientHeight ? clientHeight -1 : 0)
    }
  }

  const handlerOnKeyUp = (event) => {
    const el = inputRef.current;
    if(!el) return true;
    // Conditions need for firefox
    if(firefox && event.key === 'Backspace') {
      if(el.innerHTML.length === 1 && enter) {
        el.innerHTML = '';
        setEnter(false);
      }
      else if(brRegex.test(el.innerHTML)){
        el.innerHTML = el.innerHTML.replace(brRegex, '');
      }
    }
    checkSize();
  }

  const handlerOnKeyDown= (event) => {
    const el = inputRef.current;
    
    if( event.key === 'Backspace' && el){
      const caretPosition = getCaretIndex(inputRef.current);
      const character = el.innerHTML.charAt(caretPosition - 1);
      if(character === "\n") {
        event.preventDefault();
        event.stopPropagation();
        el.innerHTML = (el.innerHTML.substring(0, caretPosition - 1) + el.innerHTML.substring(caretPosition))
        updateCaret(el, caretPosition, -1)
      }
    }
  }

  const handlerPressEmoji = () => {
    if(vanishInput || disabledInput)
      return;
    onPressEmoji();
    checkSize();
  }

  const handlerOnInputChange = (e) => {
    if(vanishInput || disabledInput)
      return;
    if(onFileInputChange)
      onFileInputChange(e);
    else
      console.log(e);
  };

  return (
    <div ref={refContainer} className={cn("rcw-sender", { 'rcw-vanish-input': vanishInput })}>
      <button className={cn('rcw-picker-btn', { 'rcw-message-disable': vanishInput || disabledInput })} type="submit" onClick={handlerPressEmoji}>
        <img src={emoji} className="rcw-picker-icon" alt="emoji-picker" />
      </button>
      <label className="rcw-attachment-btn" htmlFor="attachment-input">
        <img src={attachment} className={cn("rcw-attachment-icon", { 'rcw-message-disable': vanishInput || disabledInput })} alt="attachment-input" aria-hidden="true"/>
        <input type='file' id='attachment-input' onChange={handlerOnInputChange} onClick={onFileInputClick||((e) => console.log(e))} disabled={vanishInput || disabledInput}/>
      </label>
      <div className={cn('rcw-new-message', { 'rcw-message-disable': vanishInput || disabledInput })
      }>
        <div
          spellCheck
          className="rcw-input"
          role="textbox"
          contentEditable={!(disabledInput||vanishInput)} 
          aria-multiline="true"
          ref={inputRef}
          placeholder={placeholder}
          onInput={handlerOnChange}
          onKeyPress={handlerOnKeyPress}
          onKeyUp={handlerOnKeyUp}
          onKeyDown={handlerOnKeyDown}
        />
        
      </div>
      <button type="submit" className={cn("rcw-send", { 'rcw-message-disable': vanishInput || disabledInput })} onClick={handlerSendMessage}>
        <img src={send} className="rcw-send-icon" alt={buttonAlt} />
      </button>
    </div>
  );
}

export default forwardRef(Sender);
