import { ElementType } from 'react';

import store from '.';
import * as actions from './actions';
import { LinkParams, ImageState } from './types';

export function addUserMessage(text: string, id?: string, date?: Date) {
  store.dispatch(actions.addUserMessage(text, id, date));
}

export function addResponseMessage(text: string, id?: string, date?: Date) {
  store.dispatch(actions.addResponseMessage(text, id, date));
}

export function addLinkSnippet(link: LinkParams, id?: string, date?: Date) {
  store.dispatch(actions.addLinkSnippet(link, id, date));
}

export function toggleMsgLoader() {
  store.dispatch(actions.toggleMsgLoader());
}

export function renderCustomComponent(component: ElementType, props: any, showAvatar = false, id?: string, date?: Date) {
  store.dispatch(actions.renderCustomComponent(component, props, showAvatar, id, date));
}

export function toggleWidget() {
  store.dispatch(actions.toggleChat());
}

export function toggleInputDisabled() {
  store.dispatch(actions.toggleInputDisabled());
}

export function toggleInputVisibility() {
  store.dispatch(actions.toggleInputVisibility());
}


export function dropMessages() {
  store.dispatch(actions.dropMessages());
}

export function isWidgetOpened(): boolean {
  return store.getState().behavior.showChat;
}

export function setQuickButtons(buttons: Array<{ label: string, value: string | number }>) {
  store.dispatch(actions.setQuickButtons(buttons));
}

export function deleteMessages(count: number, id?: string) {
  store.dispatch(actions.deleteMessages(count, id));
}

export function markAllAsRead() {
  store.dispatch(actions.markAllMessagesRead());
}

export function setBadgeCount(count: number) {
  store.dispatch(actions.setBadgeCount(count));
}

export function openFullscreenPreview(payload: ImageState) {
  store.dispatch(actions.openFullscreenPreview(payload));
}

export function closeFullscreenPreview() {
  store.dispatch(actions.closeFullscreenPreview());
}
