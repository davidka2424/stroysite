/* ====================================
   bot.js — Telegram bot integration
   ====================================
   Чтобы активировать отправку в Telegram:
   1. Создайте бота через @BotFather, получите TOKEN
   2. Узнайте CHAT_ID:  откройте https://t.me/userinfobot и перешлите
      ему сообщение от вашего бота, либо используйте:
      https://api.telegram.org/bot<TOKEN>/getUpdates
   3. Вставьте TOKEN и CHAT_ID ниже.
   ==================================== */

const TELEGRAM_BOT_TOKEN = 'ВСТАВЬТЕ_ВАШ_ТОКЕН_ЗДЕСЬ';
const TELEGRAM_CHAT_ID   = 'ВСТАВЬТЕ_ВАШ_CHAT_ID_ЗДЕСЬ';

// ─── Вспомогательные функции ──────────────────────

/**
 * Экранирует спецсимволы Markdown v2 для Telegram
 */
function escapeMd(text) {
  if (!text) return '';
  return String(text).replace(/([_*[\]()~`>#+\-=|{}.!\\])/g, '\\$1');
}

/**
 * Форматирует заявку в красивое сообщение
 */
function buildMessage(data) {
  const date = new Date().toLocaleString('ru-RU', {
    timeZone: 'Europe/Moscow',
    day:    '2-digit',
    month:  '2-digit',
    year:   'numeric',
    hour:   '2-digit',
    minute: '2-digit',
  });

  return (
    `🏗 *НОВАЯ ЗАЯВКА — СтройГрунт*\n` +
    `🕐 ${escapeMd(date)}\n\n` +
    `👤 *Имя:* ${escapeMd(data.name)}\n` +
    `📞 *Контакт:* ${escapeMd(data.contact)}\n` +
    `🔧 *Услуга:* ${escapeMd(data.service || 'Не выбрана')}\n` +
    (data.message
      ? `📝 *Описание:*\n${escapeMd(data.message)}\n`
      : '') +
    `\n_Заявка с сайта stroygrunt.ru_`
  );
}

/**
 * Отправляет сообщение через Telegram Bot API
 * @param {string} text — уже сформатированный текст
 * @returns {Promise<boolean>} — true если успешно
 */
async function sendToTelegram(text) {
  if (
    TELEGRAM_BOT_TOKEN === 'ВСТАВЬТЕ_ВАШ_ТОКЕН_ЗДЕСЬ' ||
    TELEGRAM_CHAT_ID   === 'ВСТАВЬТЕ_ВАШ_CHAT_ID_ЗДЕСЬ'
  ) {
    // Токен не настроен — логируем и эмулируем успех в dev-режиме
    console.warn(
      '[bot.js] Telegram токен не настроен.\n' +
      'Вставьте TELEGRAM_BOT_TOKEN и TELEGRAM_CHAT_ID в файл js/bot.js\n',
      'Данные заявки:', text
    );
    return true; // убрать эту строку после реальной настройки
  }

  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

  const response = await fetch(url, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id:    TELEGRAM_CHAT_ID,
      text:       text,
      parse_mode: 'MarkdownV2',
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    console.error('[bot.js] Telegram API error:', err);
    return false;
  }

  return true;
}

// ─── Обработчик формы ────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  const form      = document.getElementById('orderForm');
  const submitBtn = document.getElementById('submitBtn');
  const btnText   = submitBtn?.querySelector('.btn-text');
  const btnLoader = submitBtn?.querySelector('.btn-loader');
  const success   = document.getElementById('formSuccess');

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Валидация
    let valid = true;
    ['f-name', 'f-contact'].forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      if (!el.value.trim()) {
        el.classList.add('error');
        valid = false;
        el.addEventListener('input', () => el.classList.remove('error'), { once: true });
      }
    });
    if (!valid) return;

    // Сбор данных
    const data = {
      name:    form.querySelector('#f-name')?.value.trim()    || '',
      contact: form.querySelector('#f-contact')?.value.trim() || '',
      service: form.querySelector('#f-service')?.value        || '',
      message: form.querySelector('#f-msg')?.value.trim()     || '',
    };

    // Состояние загрузки
    submitBtn.disabled = true;
    if (btnText)   btnText.hidden   = true;
    if (btnLoader) btnLoader.hidden = false;
    if (btnLoader) btnLoader.textContent = 'Отправляем…';

    try {
      const message = buildMessage(data);
      const ok = await sendToTelegram(message);

      if (ok) {
        // Успех
        if (success) success.hidden = false;
      } else {
        throw new Error('Telegram API вернул ошибку');
      }
    } catch (err) {
      console.error('[bot.js]', err);
      alert('Не удалось отправить заявку. Пожалуйста, свяжитесь с нами по телефону или Telegram.');
      submitBtn.disabled = false;
      if (btnText)   btnText.hidden   = false;
      if (btnLoader) btnLoader.hidden = true;
    }
  });
});
