import { inspectable } from 'inspectable'

import * as Interfaces from '../../generated/telegram-interfaces'
import { filterPayload } from '../../utils/helpers'

import { Structure } from '../../types/interfaces'

import { User } from './user'
import { Location } from './location'

export class ChosenInlineResult implements Structure {
  constructor (public payload: Interfaces.TelegramChosenInlineResult) { }

  get [Symbol.toStringTag] () {
    return this.constructor.name
  }

  /** The unique identifier for the result that was chosen */
  get resultId () {
    return this.payload.result_id
  }

  /** The user that chose the result */
  get from () {
    return new User(this.payload.from)
  }

  /** Sender ID */
  get senderId () {
    return this.from.id
  }

  /** Sender location, only for bots that require user location */
  get location () {
    const { location } = this.payload

    if (!location) {
      return
    }

    return new Location(location)
  }

  /**
   * Identifier of the sent inline message. Available only if there is an
   * inline keyboard attached to the message. Will be also received in callback
   * queries and can be used to edit the message.
   */
  get inlineMessageId () {
    return this.payload.inline_message_id
  }

  /** The query that was used to obtain the result */
  get query () {
    return this.payload.query
  }

  toJSON (): Interfaces.TelegramChosenInlineResult {
    return {
      result_id: this.resultId,
      from: this.from.toJSON(),
      sender_id: this.senderId,
      location: this.location,
      inline_message_id: this.inlineMessageId,
      query: this.query
    }
  }
}

inspectable(ChosenInlineResult, {
  serialize (struct) {
    const payload = {
      resultId: struct.resultId,
      from: struct.from,
      senderId: struct.senderId,
      location: struct.location,
      inlineMessageId: struct.inlineMessageId,
      query: struct.query
    }

    return filterPayload(payload)
  }
})
