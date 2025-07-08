import {
    Instance,
    SnapshotIn,
    applySnapshot,
    cast,
    destroy,
    detach,
    flow,
    getEnv,
    getParent,
    getParentOfType,
    getSnapshot,
    isStateTreeNode,
    onPatch,
    types,
} from 'mobx-state-tree';

import { ChatChannelTypeEnum, ChatListItemStatusEnum, ErrorTypeEnum } from '@chats/types';
import { Resource, ResourceModel, ResourceTypeEnum } from '@chats/models/chats/Resource';
import { formatFilename, safeDecode } from '@chats/utils';
import { ChatScheduledMessagesStore } from './ChatScheduledMessagesStore';
import { getRoot } from '@chats/utils';

import {
    ChatMessage,
    ChatMessageModel,
    ChatMessagesStore,
} from '@chats/models/chats/ChatMessaagesStore';

type TransferResultEvent = {
    chat_id: number;
    to_employee_id: number;
};

export enum TransferTarget {
    Employees = 'employees',
    Groups = 'groups',
}

export enum MessageStatusEnum {
    Sent = 'sent',
    Delivered = 'delivered',
    Read = 'read',
    Error = 'error',
}

const ChatTransferState = types
    .model('ChatTransferState', {
        state: types.maybeNull(types.string),
        target: types.optional(types.array(types.number), []),
        comment: types.optional(types.string, ''),
        timerId: types.maybeNull(types.number),
        acceptedBy: types.maybeNull(types.number),
        closeTime: types.maybeNull(types.number),
        targetType: types.maybeNull(types.enumeration(Object.values(TransferTarget))),
    })
    .actions(self => {
        const { chatListStore } = getRoot(self);
        const setState = (newState: string, params?: TransferResultEvent) => {
            self.state = newState;
            const chat = chatListStore.getChatById(params?.chat_id);
            clearTimeout(self.timerId);
            if (newState === 'transferAccepted' && chat.status === ChatListItemStatusEnum.active) {
                self.acceptedBy = params.to_employee_id;
                // Чат удаляется только если он всё ещё во вкладке активные.
                // Если происходит переключение вкладки на чужие - он удаляется из активных ещё при переключении вкладки.
                setTimeout(() => {
                    if (chatListStore.currentTab !== 2 && chat.transferState.state === 'transferAccepted') {
                        chatListStore.deleteChat(chat.id);
                    }
                }, VISIBLE_ALARM_TIME);
            }

            if (newState === 'transferDeclined') {
                if (chatListStore.selectedChat.id === params.chat_id) {
                    self.timerId = +setTimeout(() => {
                        if (chat.status === ChatListItemStatusEnum.active && chat.transferState.state !== 'transfer')
                            chat.transferState.setState(null);
                    }, VISIBLE_ALARM_TIME);
                } else {
                    const patchDisposer = onPatch(chatListStore, patch => {
                        if (patch.op === 'replace' && patch.path === '/selectedChat') {
                            patchDisposer();
                            self.timerId = +setTimeout(() => {
                                chat.transferState.setState(null);
                            }, VISIBLE_ALARM_TIME);
                        }
                    });
                }
            }
        };
        return { setState };
    });

const ChatContextPhone = types.model('ChatContextPhone', {
    phone: types.maybeNull(types.string),
});

const ChatContextConversationFrame = types.model('ChatContextConversationFrame', {
    conversation_frame_ts: types.number,
});

export const ContactModel = types.model({
    id: types.maybeNull(types.number),
    personal_manager_id: types.maybeNull(types.number),
    first_name: types.maybeNull(types.string),
    last_name: types.maybeNull(types.string),
    full_name: types.maybeNull(types.string),
    organization_name: types.maybeNull(types.string),
    patronymic: types.maybeNull(types.string),
    phone_list: types.optional(types.array(types.string), []),
    email_list: types.optional(types.array(types.string), []),
    chat_channel_list: types.optional(
        types.array(
            types.model({
                phone: types.maybeNull(types.string),
                type: types.string,
                ext_id: types.maybeNull(types.string),
                chat_channel_id: types.maybeNull(types.number),
            })
        ),
        []
    ),
    group_list: types.optional(types.array(types.string), []),
});
export type ContactModel = Instance<typeof ContactModel>;
export type ContactModelSnapshot = SnapshotIn<typeof ContactModel>;

export const LastMessage = types
    .model('LastMessage', {
        id: types.maybeNull(types.union(types.number, types.string)),
        message: types.maybeNull(types.string),
        date: types.maybeNull(types.union(types.Date, types.string)),
        is_operator: types.maybeNull(types.boolean),
        resource_type: types.maybeNull(
            types.enumeration<ResourceTypeEnum>('ResourceTypeEnum', Object.values(ResourceTypeEnum))
        ),
        resource_name: types.maybeNull(types.string),
        status: types.maybeNull(
            types.enumeration<MessageStatusEnum>('MessageStatusEnum', Object.values(MessageStatusEnum))
        ),
        employee_id: types.maybeNull(types.number),
        visitor_id: types.maybeNull(types.number),
    })
    .views(self => ({
        get display(): string {
            const resourceName = self.resource_name ? formatFilename(safeDecode(self.resource_name), 20) : '';
            return self.message || resourceName;
        },
    }));

export type LastMessageModel = Instance<typeof LastMessage>;
export type LastMessageModelSnapshot = SnapshotIn<typeof LastMessage>;

export const ChatListItem = types
    .model('ChatListItem', {
        id: types.identifierNumber,
        chat_channel_id: types.number,
        chat_channel_type: types.enumeration<ChatChannelTypeEnum>(
            'ChatChannelTypeEnum',
            Object.values(ChatChannelTypeEnum)
        ),
        channel_name: types.maybeNull(types.string),
        channel_id: types.maybeNull(types.number),
        status: types.enumeration<ChatListItemStatusEnum>(
            'ChatListItemStatusEnum',
            Object.values(ChatListItemStatusEnum)
        ),
        unread_message_count: types.maybeNull(types.number),
        channel_employee_id: types.maybeNull(types.number),
        date_time: types.maybeNull(types.union(types.Date, types.string)),
        mark_ids: types.array(types.string),
        comment: types.maybeNull(types.string),
        phone: types.maybeNull(types.string),
        ext_id: types.maybeNull(types.string),
        site_id: types.maybeNull(types.number),
        visitor_pic_url: types.maybeNull(types.string),
        visitor_id: types.maybeNull(types.number),
        visitor_name: types.maybeNull(types.string),
        name: types.maybeNull(types.string),
        visitor_type: types.maybeNull(types.string), // TODO: make enum
        last_message: types.maybeNull(LastMessage),
        contact: types.maybeNull(ContactModel),
        messages: types.optional(ChatMessagesStore, {}),
        // заменить на полноценную ссылку
        editingMessage: types.union(
            types.maybeNull(
                types.reference(ChatMessage, {
                    onInvalidated: event => {
                        if (event.cause === 'destroy' || event.cause === 'invalidSnapshotReference') {
                            event.removeRef();
                        }
                    },
                })
            ),
            types.maybeNull(ChatMessage)
        ),
        scheduledStore: types.optional(ChatScheduledMessagesStore, {}),
        messagesAreFetched: types.optional(types.boolean, false),
        context: types.union(types.maybeNull(ChatContextConversationFrame), types.maybeNull(ChatContextPhone)),
        notificationIsVisible: types.optional(types.boolean, false),
        transferState: types.maybeNull(ChatTransferState),
        additionalInfo: types.maybeNull(ChatAdditionalInfo),
        employee_id: types.maybeNull(types.number),
        channel_employees_group_id: types.maybeNull(types.number),
        is_phone_auto_filled: types.optional(types.boolean, false),
        is_pinned: types.optional(types.maybeNull(types.boolean), false),
        username: types.maybeNull(types.string),
        avatar: types.maybeNull(Resource),
        visitor_ids: types.optional(types.array(types.number), []),
        group_chat_id: types.maybeNull(types.number),
        system_chat_status: types.enumeration<SystemChatStatusEnum>(
            'SystemChatStatusEnum',
            Object.values(SystemChatStatusEnum)
        ),
        isAcceptingChat: types.optional(types.boolean, false),
    })
    .views(self => ({
        get channel(): ChatChannelModel | null {
            const { chatChannelsStore } = getRoot(self);
            return chatChannelsStore.getById(self.chat_channel_id);
        },
        get site(): SiteModel | null {
            const { sitesStore } = getRoot(self);
            return sitesStore.getById(self.site_id);
        },
        get isChannelAlive(): boolean {
            const channel = this.channel;
            if (!channel) return false;
            return !['error', 'deleted', 'inactive', 'disconnected', 'init'].includes(channel.status as string);
        },
        get avatarUrl(): string | null {
            const avatarPayload = self.avatar?.thumbs?.['100x100']?.payload;
            const avatarUrl = avatarPayload ? `data:image/png;base64, ${avatarPayload}` : avatarPayload;

            return avatarUrl;
        },
    }))
    .actions(self => {
        const rootStore = getRoot(self);
        const httpRpc: HttpRpcRequest = rootStore.httpRpc;
        const chatApiRest: HttpRestRequest = rootStore.chatApiRest;
        const { chatPendingMessagesStore, chatListStore, notificationsStore, accountStore } = rootStore;

        const setEmployeeId = (id: number | null) => {
            self.employee_id = id;
        };

        const setContact = (contact: ContactModel | ContactModelSnapshot) => {
            if (self.contact) {
                detach(self.contact);
            }
            self.contact = cast(contact);
        };

        const setMarkIds = function (new_ids: string[]) {
            self.mark_ids = cast(new_ids);
        };

        const updateChatPhone = flow(function* (phone: string) {
            try {
                yield chatApiRest({
                    method: 'POST',
                    url: '/chat/phone',
                    data: {
                        phone: phone,
                        chat_id: self.id,
                    },
                });
            } catch (e) {
                console.error(e);
            }
        });

        const updateChatTags = flow(function* (mark_ids: Array<string | number>) {
            yield chatApiRest({
                method: 'POST',
                url: '/chat/mark',
                data: {
                    id: self.id,
                    mark_ids: mark_ids.map(id => Number(id)),
                },
            });
            void chatListStore.fetchSingleChat(chatListStore.selectedChat.id);
        });

        const updateFoundChatStatus = (chatId: number, status: ChatListItemStatusEnum) => {
            const rootStore = getRoot(self);
            const { chatsSearchStore, accountStore } = rootStore;

            // Обновление статуса чата в списке найденных при поиске
            if (chatsSearchStore.found_chats?.length > 0) {
                const chat = chatsSearchStore.found_chats.find(chat => chat.id === chatId);
                if (chat) {
                    chat.setStatus(status);
                    chat.setEmployeeId(accountStore.account.employee_id);
                }
            }
        };

        const setIsAcceptingChat = (value: boolean) => {
            self.isAcceptingChat = value;
        };

        const acceptChat = flow(function* () {
            try {
                setIsAcceptingChat(true);
                yield httpRpc('accept_chat', {
                    chat_id: self.id,
                    visitor_id: self.visitor_id,
                });

                setStatus(ChatListItemStatusEnum.active);
                updateFoundChatStatus(self.id, ChatListItemStatusEnum.active);
            } catch (e) {
                if (e.message === 'Chat already accepted') {
                    chatListStore.deleteChat(self.id);
                    const error = ErrorTypeEnum.chat_intercepted;
                    notificationsStore.addErrorNotification(error);

                    if (chatListStore.currentTab !== 0) {
                        chatListStore.setCurrentTab(0);
                    }
                } else {
                    console.error(e);
                }
            } finally {
                setIsAcceptingChat(false);
            }
        });

        const closeChat = flow(function* () {
            try {
                yield httpRpc('close_chat', {
                    chat_id: self.id,
                    visitor_id: self.visitor_id,
                });

                void chatListStore.setSelectedChat(null);
                updateFoundChatStatus(self.id, ChatListItemStatusEnum.closed);
            } catch (e) {
                if (e.message.startsWith('Для завершения чата') || e.message.startsWith('To end the chat')) {
                    notificationsStore.addErrorNotification(ErrorTypeEnum.chat_tag_required);
                } else {
                    console.error(e);
                }
            }
        });

        const setStatus = (status: ChatListItemStatusEnum): void => {
            if (self.status === status) return;
            const parent = getParentOfType(self, ChatsListStore);
            self.status = status;
            if (self.system_chat_status !== SystemChatStatusEnum.group) {
                self.system_chat_status = status as unknown as SystemChatStatusEnum;
            }
            parent.moveChatItemByStatus(cast(self), status as unknown as SystemChatStatusEnum);
        };

        const setLastMessage = (lastMessage: LastMessageModel | LastMessageModelSnapshot): void => {
            self.last_message = cast(lastMessage);
        };

        const setMessageUnreadCount = (unreadMessageCount: number): void => {
            self.unread_message_count = unreadMessageCount;
        };

        const setIsPhoneAutoFilled = (is_phone_auto_filled: boolean): void => {
            self.is_phone_auto_filled = is_phone_auto_filled;
        };

        const setLastMessageTime = (time: Date): void => {
            self.date_time = time;
        };

        const setMessagesAreFetched = (status: boolean): void => {
            self.messagesAreFetched = status;
        };

        const setVisitorName = (name: string): void => {
            self.visitor_name = name;
        };

        const setName = (name: string): void => {
            self.name = name;
        };

        const onSendOtherChatHandler = async () => {
            if (chatListStore.selectedChat.status === ChatListItemStatusEnum.other) {
                const chatId = chatListStore.selectedChat.id;
                await chatListStore.selectedChat.messages.markAllAsRead();
                chatListStore.setRedirectToItself(true);

                await chatListStore.redirectChats(
                    [chatId],
                    accountStore.account.employee_id,
                    accountStore.account.user_name
                );
                await chatListStore.selectedChat.messages.fetchChatMessages();
                chatListStore.setCurrentTab(1);
                chatListStore.setSelectedChat(chatId);
            }
        };

        const onAfterSendHandler = () => {
            chatListStore.newMessageChatHoisting(chatListStore.selectedChat.id);
            chatListStore.selectedChat.messages.setMessageToReply(null);
        };

        const createMessage = (messageText: string, replyToMessage: ChatMessageModel = null) => {
            logger.log(`Creating message: ${messageText}`);

            // TODO: вычислять это исходя из возможностей адаптера?
            const chunks = sliceTextIntoChunks(messageText, 4000);

            chunks.forEach(chunk => {
                logger.log(`Start processing chunk: ${chunk}`);

                const msg = (() => {
                    try {
                        return self.messages.addSendingMessage(self.id, new Date(), chunk, replyToMessage);
                    } catch (e) {
                        logger.logValue?.(e, `Failed to add sending message ${chunk}`);
                        throw e;
                    }
                })();

                logger.log(`Added chunk locally: ${chunk}`);
                chatPendingMessagesStore.sendMessage(self as ChatListItemModel, msg);
            });
        };

        const editMessage = flow(function* (messageId: number, newText: string) {
            try {
                const message = self.messages.getMessageById(messageId);

                const oldStatus = message.status;
                message.setStatus(null);

                yield chatApiRest({
                    method: 'PATCH',
                    url: '/chat/message',
                    data: {
                        chat_id: self.id,
                        message: {
                            id: messageId,
                            text: newText,
                        },
                    },
                });

                message.setStatus(oldStatus);
                // Обновление локального состояния сообщения после успешного запроса

                if (message) {
                    message.setText(newText);
                }
            } catch (e) {
                console.error('Ошибка при редактировании сообщения:', e);
            }
        });

        const createMessageWithWabaTemplate = (context: any) => {
            const res = chatListStore.selectedChat.messages.addSendingMessage(
                self.id,
                new Date(),
                (context.template as messageTemplateContentModelIn).text,
                null,
                null,
                context
            );
            chatPendingMessagesStore.sendMessage(self as ChatListItemModel, res);
        };
        const createEmailMessage = (text: string, replyToMessage: ChatMessageModel = null, context: any) => {
            const res = chatListStore.selectedChat.messages.addSendingMessage(
                self.id,
                new Date(),
                text,
                replyToMessage,
                null,
                context
            );
            chatPendingMessagesStore.sendMessage(self as ChatListItemModel, res);
        };

        const createMessageWithFiles = flow(function* (
            messageText: string,
            replyToMessage: ChatMessageModel = null,
            uploadingFiles: ResourceModel[],
            context?: SubjectContextType
        ) {
            if (!uploadingFiles || !uploadingFiles.length) {
                logger.log(`Refused to create message with files: ${messageText}`);
                throw new Error('File array must not be empty');
            }

            logger.log(`Creating message with files: ${messageText}`);

            context
                ? createEmailMessage(messageText, replyToMessage, context)
                : createMessage(messageText, replyToMessage);
            const messageArray: ChatMessageModel[] = [];

            for (let i = 0; i < uploadingFiles.length; i++) {
                let resource: ResourceModel;

                if (uploadingFiles[i].file) {
                    resource = yield createResourceModelByFile(uploadingFiles[i].file);
                } else {
                    resource = getSnapshot<ResourceModel>(uploadingFiles[i]);
                }
                messageArray.push(
                    chatListStore.selectedChat.messages.addSendingMessage(
                        self.id,
                        new Date(),
                        '',
                        replyToMessage,
                        resource,
                        context ? context : null
                    )
                );
            }

            void Promise.allSettled(messageArray.map(msg => msg.createResource())).then(results => {
                let hasError = false;
                results.forEach((res, index) => {
                    if (res.status === 'fulfilled') {
                        chatPendingMessagesStore.sendMessage(self as ChatListItemModel, messageArray[index]);
                    } else {
                        hasError = true;
                    }
                });
                if (hasError) {
                    notificationsStore.addErrorNotification('unknown_file_uploading' as ErrorTypeEnum);
                }
            });
        });

        const retryMessage = (messageFrontId: string) => {
            chatPendingMessagesStore.sendMessage(
                self as ChatListItemModel,
                self.messages.resetPendingMessage(messageFrontId)
            );
        };

        const fetchAdditionalInfo = flow(function* () {
            try {
                const response = yield chatApiRest({
                    url: `/chat/info`,
                    method: 'GET',
                    params: {
                        chat_id: self.id,
                    },
                });
                self.additionalInfo = response;
            } catch (e) {
                console.error(e);
            }
        });

        const abortTransfer = flow(function* (clearState = false, isTimeout = false) {
            clearTimeout(self.transferState.timerId);
            try {
                yield chatApiRest({
                    url: `/transfer`,
                    method: 'DELETE',
                    data: {
                        chat_id: self.id,
                        is_timeout: isTimeout,
                    },
                });
                if (clearState) {
                    self.transferState = null;
                }
            } catch (e) {
                console.error(e);
            }
        });

        const pin = () => (self.is_pinned = true);

        const setEditingMessage = (message: ChatMessageModel) => {
            self.editingMessage = cast(message);
        };

        return {
            pin,
            acceptChat,
            closeChat,
            setStatus,
            setContact,
            setLastMessage,
            setIsPhoneAutoFilled,
            setMessageUnreadCount,
            setMessagesAreFetched,
            setLastMessageTime,
            createMessage,
            editMessage,
            abortTransfer,
            retryMessage,
            fetchAdditionalInfo,
            setVisitorName,
            updateChatPhone,
            updateChatTags,
            createMessageWithFiles,
            createMessageWithWabaTemplate,
            createEmailMessage,
            onSendOtherChatHandler,
            onAfterSendHandler,
            setEmployeeId,
            setEditingMessage,
            setMarkIds,
            setName,
        };
    })
    .actions(self => ({
        transfer: flow(function* (target: number[], comment = '', toForce = false) {
            const rootStore = getRoot(self);
            const { chatListStore, chatTransfersStore } = rootStore;
            const chatApiRest: HttpRestRequest = rootStore.chatApiRest;

            try {
                yield chatApiRest({
                    url: `/transfer`,
                    method: 'POST',
                    data: {
                        chat_id: self.id,
                        comment: comment,
                        employees: target,
                        is_force: toForce,
                    },
                });
                if (toForce) {
                    const chat = chatListStore.getChatById(self.id);
                    self.transferState = cast({
                        state: 'transfer',
                        target: target,
                        comment: comment,
                        timerId: VISIBLE_ALARM_TIME,
                        closeTime: null,
                        targetType: null,
                    });
                    chat.transferState.setState('transferDeclined', {
                        chat_id: self.id,
                        to_employee_id: target[0],
                    });
                    chat.transferState.setState('transferAccepted', {
                        chat_id: self.id,
                        to_employee_id: target[0],
                    });
                    chatListStore.setCountersAreLoading(true);
                    chatTransfersStore.removeIncomingTransfer(chat.id);
                    return;
                }
                self.transferState = cast({
                    state: 'transfer',
                    target: target,
                    comment: comment,
                    timerId: +setTimeout(() => {
                        void self.abortTransfer(false, true).then(() => {
                            self.transferState.setState('transferDeclined', {
                                chat_id: self.id,
                                to_employee_id: target[0],
                            });
                        });
                    }, TRANSFER_AWAIT_TIMEOUT),
                    closeTime: Date.now() + TRANSFER_AWAIT_TIMEOUT + 1000,
                    targetType: TransferTarget.Employees,
                });
            } catch (e) {
                self.transferState = null;
                console.error(e);
            }
        }),
        transferToGroup: flow(function* (group: number, comment = '') {
            const rootStore = getRoot(self),
                chatApiRest: HttpRestRequest = rootStore.chatApiRest;

            try {
                yield chatApiRest({
                    url: `/transfer_to_group`,
                    method: 'POST',
                    data: {
                        chat_id: self.id,
                        comment: comment,
                        group_id: group,
                    },
                });

                self.transferState = cast({
                    state: 'transfer',
                    target: [group],
                    comment: comment,
                    timerId: +setTimeout(() => {
                        void self.abortTransfer(undefined, true).then(() => {
                            self.transferState.setState('transferDeclined', {
                                chat_id: self.id,
                                to_employee_id: null,
                            });
                        });
                    }, TRANSFER_AWAIT_TIMEOUT),
                    closeTime: Date.now() + TRANSFER_AWAIT_TIMEOUT + 1000,
                    targetType: TransferTarget.Groups,
                });
            } catch (e) {
                self.transferState = null;
                console.error(e);
            }
        }),
    }));

export type ChatListItemModel = Instance<typeof ChatListItem>;
export type ChatListItemModelSnapshot = SnapshotIn<typeof ChatListItem>;
