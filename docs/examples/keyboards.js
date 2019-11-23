let { Telegram, Keyboard, InlineKeyboard } = require('puregram');

let telegram = new Telegram({
  token: process.env.TOKEN,
});

telegram.updates.setHearFallbackHandler(
  context => context.send('Enter either /keyboard or /inline.'),
);

telegram.updates.hear('/keyboard', (context) => {
  return context.send('There\'s your keyboard!', {
    reply_markup: Keyboard.keyboard([
      [
        Keyboard.textButton('Button'),
      ],

      [
        Keyboard.textButton('Another button'),
        Keyboard.textButton('But there\'s more!'),
      ],

      [
        Keyboard.textButton('So'),
        Keyboard.textButton('many'),
        Keyboard.textButton('buttons!'),
      ],
    ]).resize(),
  });
});

telegram.updates.hear('/inline', (context) => {
  return context.send('There\'s your keyboard!', {
    reply_markup: InlineKeyboard.keyboard([
      [
        InlineKeyboard.textButton({
          text: 'Inline button!',
        }),
      ],

      [
        InlineKeyboard.textButton({
          text: 'And there\'s more!',
        }),

        InlineKeyboard.textButton({
          text: 'Payload button',
          payload: { payload: true },
        }),
      ],

      [
        InlineKeyboard.textButton({
          text: 'This',
        }),

        InlineKeyboard.textButton({
          text: 'is',
        }),

        InlineKeyboard.textButton({
          text: 'epic!',
        }),
      ],
    ]),
  });
});

telegram.updates.on('callback_query', (context) => {
  return context.answerCallbackQuery('You just clicked the payload button!');
});

telegram.updates.startPolling();
