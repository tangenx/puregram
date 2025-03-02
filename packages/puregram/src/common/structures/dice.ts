import { inspectable } from 'inspectable'

import * as Methods from '../../generated/methods'
import * as Interfaces from '../../generated/telegram-interfaces'

import { Structure } from '../../types/interfaces'

/** This object represents an animated emoji that displays a random value. */
export class Dice implements Structure {
  constructor (private payload: Interfaces.TelegramDice) { }

  get [Symbol.toStringTag] () {
    return this.constructor.name
  }

  /** Emoji on which the dice throw animation is based */
  get emoji () {
    return this.payload.emoji as NonNullable<Methods.SendDiceParams['emoji']>
  }

  /**
   * Value of the dice,
   * `1-6` for `🎲`, `🎯` and `🎳` base emoji,
   * `1-5` for `🏀` and `⚽️` base emoji,
   * `1-64` for `🎰` base emoji
   */
  get value () {
    return this.payload.value
  }

  toJSON (): Interfaces.TelegramDice {
    return {
      emoji: this.emoji,
      value: this.value
    }
  }
}

inspectable(Dice, {
  serialize (struct) {
    return {
      emoji: struct.emoji,
      value: struct.value
    }
  }
})
