import { inspectable } from 'inspectable'

import * as Interfaces from '../../generated/telegram-interfaces'

import { Structure } from '../../types/interfaces'

import { Chat } from './chat'
import { User } from './user'
import { ChatInviteLink } from './chat-invite-link'

export class ChatJoinRequest implements Structure {
  constructor (public payload: Interfaces.TelegramChatJoinRequest) { }

  get [Symbol.toStringTag] () {
    return this.constructor.name
  }

  /** Chat to which the request was sent */
  get chat () {
    return new Chat(this.payload.chat)
  }

  /** User that sent the join request */
  get from () {
    return new User(this.payload.from)
  }

  /** Date the request was sent in Unix time */
  get date () {
    return this.payload.date
  }

  /** Bio of the user */
  get bio () {
    return this.payload.bio
  }

  /** Chat invite link that was used by the user to send the join request */
  get inviteLink () {
    const { invite_link } = this.payload

    if (!invite_link) {
      return
    }

    return new ChatInviteLink(invite_link)
  }

  toJSON (): Interfaces.TelegramChatJoinRequest {
    return {
      chat: this.chat.toJSON(),
      date: this.date,
      from: this.from.toJSON(),
      bio: this.bio,
      invite_link: this.inviteLink?.toJSON()
    }
  }
}

inspectable(ChatJoinRequest, {
  serialize (struct) {
    return {
      chat: struct.chat,
      from: struct.from,
      date: struct.date,
      bio: struct.bio,
      inviteLink: struct.inviteLink
    }
  }
})
