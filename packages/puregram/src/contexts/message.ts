import { inspectable } from 'inspectable'

import { Telegram } from '../telegram'
import { Message } from '../updates/'

import * as Interfaces from '../generated/telegram-interfaces'

import { AttachmentType as AttachmentTypeEnum, EntityType } from '../types/enums'
import { AttachmentType, Constructor, UpdateName } from '../types/types'
import { applyMixins, filterPayload, isParseable } from '../utils/helpers'
import { EVENTS, SERVICE_MESSAGE_EVENTS } from '../utils/constants'

import {
  AnimationAttachment,
  Attachment,
  AudioAttachment,
  ContactAttachment,
  DocumentAttachment,
  LocationAttachment,
  PhotoAttachment,
  PollAttachment,
  StickerAttachment,
  VenueAttachment,
  VideoAttachment,
  VideoNoteAttachment,
  VoiceAttachment
} from '../common/attachments'
import { MessageEntity } from '../common/structures'
import { MediaGroup } from '../common/media-group'

import { Context } from './context'
import { NodeMixin, SendMixin, TargetMixin, CloneMixin } from './mixins'

interface MessageContextOptions {
  telegram: Telegram
  update?: Interfaces.TelegramUpdate
  payload: Interfaces.TelegramMessage
  updateId?: number
  type?: UpdateName
}

/** Called when `message` event occurs */
class MessageContext extends Context {
  payload: Interfaces.TelegramMessage

  #text: string | undefined
  #caption: string | undefined

  mediaGroup?: MediaGroup

  constructor(options: MessageContextOptions) {
    super({
      telegram: options.telegram,
      updateType: options.type ?? 'message',
      updateId: options.updateId,
      update: options.update
    })

    this.payload = options.payload

    this.#text = this.payload.text
    this.#caption = this.payload.caption
  }

  /**
   * For text messages, the actual UTF-8 text of the message, 0-4096 characters
   */
  get text() {
    return this.#text
  }

  set text(text) {
    this.#text = text
  }

  /** Checks if the message has `text` property */
  get hasText() {
    return this.text !== undefined
  }

  /**
   * Caption for the animation, audio, document, photo, video or voice,
   * 0-1024 characters
   */
  get caption() {
    return this.#caption
  }

  set caption(caption) {
    this.#caption = caption
  }

  /** Checks if the message has `caption` property */
  get hasCaption() {
    return this.caption !== undefined
  }

  /** Checks if the message has `dice` property */
  get hasDice() {
    return this.dice !== undefined
  }

  get startPayload() {
    if (!this.hasText) {
      return
    }

    if (!this.text!.startsWith('/start') || this.text === '/start') {
      return
    }

    let payload: any = this.text!.split(' ')[1]

    if (!Number.isNaN(+payload)) {
      payload = Number.parseInt(payload, 10)
    } else if (isParseable(payload)) {
      payload = JSON.parse(payload)
    }

    return payload
  }

  /** Does this message have start payload? */
  get hasStartPayload() {
    return this.startPayload !== undefined
  }

  /** Checks if the message has `author_signature` property */
  get hasAuthorSignature() {
    return this.authorSignature !== undefined
  }

  /** Checks if there are any entities (with specified type) */
  hasEntities(type?: EntityType | MessageEntity['type']) {
    if (type === undefined) {
      return this.entities.length !== 0
    }

    return this.entities.some(entity => entity.type === type)
  }

  /** Checks if there are any caption entities (with specified type) */
  hasCaptionEntities(type?: EntityType | MessageEntity['type']) {
    if (type === undefined) {
      return this.captionEntities.length !== 0
    }

    return this.captionEntities.some(entity => entity.type === type)
  }

  /** Checks whether current message contains a media group (`mergeMediaEvents` must be on) */
  get isMediaGroup() {
    return this.mediaGroupId !== undefined
  }

  /** Message attachment */
  get attachment() {
    if (this.photo) {
      return new PhotoAttachment(this.photo)
    }

    if (this.contact) {
      return new ContactAttachment(this.payload.contact!)
    }

    if (this.poll) {
      return new PollAttachment(this.payload.poll!)
    }

    if (this.venue) {
      return new VenueAttachment(this.payload.venue!)
    }

    if (this.location) {
      return new LocationAttachment(this.payload.location!)
    }

    return this.animation ?? this.audio ?? this.document ?? this.sticker ?? this.video ?? this.videoNote ?? this.voice
  }

  /** Does this message have an attachment with a specific type `type`? */
  hasAttachmentType(type: AttachmentType) {
    return this.attachment?.attachmentType === type
  }

  /** Does this message even have an attachment? */
  get hasAttachment() {
    return this.attachment !== undefined
  }

  /** Is this message an event? */
  get isEvent() {
    return EVENTS.some(event => this[event[0]] !== undefined)
  }

  /** Event type */
  get eventType() {
    if (!this.isEvent) {
      return
    }

    const value = EVENTS.find(
      (event) => {
        const tValue = this[event[0]]

        if (Array.isArray(tValue)) {
          return tValue.length !== 0
        }

        return tValue !== undefined
      }
    )

    if (value === undefined) {
      return
    }

    return value[1]
  }

  /** Is this message a service one? */
  get isServiceMessage() {
    return SERVICE_MESSAGE_EVENTS.some(event => this.payload[event] !== undefined)
  }

  /** Is this message a forwarded one? */
  get isForwarded() {
    return this.forwardedMessage !== undefined
  }

  /** Does this message have reply message? */
  get hasReplyMessage() {
    return this.replyMessage !== undefined
  }

  /** Checks if the sent message has `via_bot` property */
  get hasViaBot() {
    return this.viaBot !== undefined
  }

  /** @deprecated use `attachment` instead */
  get attachments() {
    return [this.attachment] as Attachment[]
  }

  /** @deprecated use `hasAttachmentType(type)` and `hasAttachment` instead */
  hasAttachments(type?: AttachmentType | AttachmentTypeEnum) {
    if (type === undefined) {
      return this.hasAttachment
    }

    return this.hasAttachmentType(type)
  }

  /** @deprecated */
  getAttachments(type: AttachmentTypeEnum.Animation | 'animation'): AnimationAttachment[]
  getAttachments(type: AttachmentTypeEnum.Audio | 'audio'): AudioAttachment[]
  getAttachments(type: AttachmentTypeEnum.Document | 'document'): DocumentAttachment[]
  getAttachments(type: AttachmentTypeEnum.Photo | 'photo'): PhotoAttachment[]
  getAttachments(type: AttachmentTypeEnum.Sticker | 'sticker'): StickerAttachment[]
  getAttachments(type: AttachmentTypeEnum.Video | 'video'): VideoAttachment[]
  getAttachments(type: AttachmentTypeEnum.VideoNote | 'video_note'): VideoNoteAttachment[]
  getAttachments(type: AttachmentTypeEnum.Voice | 'voice'): VoiceAttachment[]
  getAttachments(type?: AttachmentType | AttachmentTypeEnum): Attachment[]
  getAttachments(type?: any): Attachment[] {
    if (type === undefined) {
      return this.attachments
    }

    return this.attachments.filter(attachment => attachment.attachmentType === type)
  }

  /** @deprecated use `isForwarded` instead */
  get isForward() {
    return this.isForwarded
  }
}

interface MessageContext extends Constructor<MessageContext>, Message, TargetMixin, SendMixin, NodeMixin, CloneMixin<MessageContext, MessageContextOptions> { }
applyMixins(MessageContext, [Message, TargetMixin, SendMixin, NodeMixin, CloneMixin])

inspectable(MessageContext, {
  serialize(context) {
    const payload: Record<string, any> = {
      id: context.id,
      from: context.from,
      createdAt: context.createdAt,
      chat: context.chat,
      forwardMessage: context.forwardedMessage,
      replyMessage: context.replyMessage,
      viaBot: context.viaBot,
      updatedAt: context.updatedAt,
      authorSignature: context.authorSignature,
      text: context.text,
      entities: context.entities,
      captionEntities: context.captionEntities,
      dice: context.dice,
      caption: context.caption,
      contact: context.contact,
      location: context.location,
      venue: context.venue,
      poll: context.poll,
      replyMarkup: context.replyMarkup
    }

    if (context.mediaGroup !== undefined) {
      payload.mediaGroup = context.mediaGroup
    } else {
      payload.mediaGroupId = context.mediaGroupId
      payload.attachments = context.attachments
    }

    return filterPayload(payload)
  }
})

export { MessageContext }
