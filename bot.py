"""
Telegram бот для навигации по кампусу.
Запускает Mini App для выбора маршрута.
"""

from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo, MenuButtonWebApp
from telegram.ext import Application, CommandHandler, ContextTypes

# Токен бота (получить у @BotFather)
BOT_TOKEN = "8366795326:AAEA77NOMXu3wGvg4Adl3Ei2Y-ujmlGgr6w"

# URL Mini App (GitHub Pages)
MINI_APP_URL = "https://nishikiken.github.io/campus-navigator"


async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Обработчик команды /start — кнопка для открытия Mini App."""
    keyboard = [[
        InlineKeyboardButton("🗺️ Открыть навигатор", web_app=WebAppInfo(url=MINI_APP_URL))
    ]]
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    await update.message.reply_text(
        "👋 Привет! Я помогу с навигацией по кампусу.\n\n"
        "Нажми кнопку ниже или используй меню слева от поля ввода 👇",
        reply_markup=reply_markup
    )


async def post_init(application) -> None:
    """Устанавливает Menu Button после запуска бота."""
    await application.bot.set_chat_menu_button(
        menu_button=MenuButtonWebApp(
            text="🗺️ Навигатор",
            web_app=WebAppInfo(url=MINI_APP_URL)
        )
    )


def main() -> None:
    """Запуск бота."""
    application = Application.builder().token(BOT_TOKEN).post_init(post_init).build()
    
    application.add_handler(CommandHandler("start", start))

    application.run_polling(allowed_updates=Update.ALL_TYPES)


if __name__ == "__main__":
    main()
