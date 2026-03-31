"""
Скрипт для управления пользователями Campus Navigator.
Запускай этот файл для просмотра и редактирования данных пользователей.
"""

from api_client import get_user, create_user, add_tokens, add_rating, get_leaderboard


def main_menu():
    """Главное меню управления пользователями."""
    while True:











        choice = input("\nВыбери действие (0-6): ").strip()
        
        if choice == "1":
            view_user()
        elif choice == "2":
            create_new_user()
        elif choice == "3":
            add_user_tokens()
        elif choice == "4":
            add_user_rating()
        elif choice == "5":
            show_leaderboard()
        elif choice == "6":
            show_top_10()
        elif choice == "0":

            break
        else:

def view_user():
    """Просмотр данных пользователя."""

    telegram_id = input("Введи Telegram ID: ").strip()
    
    if not telegram_id.isdigit():

        return
    
    user = get_user(int(telegram_id))
    if user:







    else:

def create_new_user():
    """Создание нового пользователя."""

    telegram_id = input("Введи Telegram ID: ").strip()
    name = input("Введи имя: ").strip()
    avatar_url = input("Введи URL аватара (или Enter для пропуска): ").strip()
    
    if not telegram_id.isdigit():

        return
    
    if not name:

        return
    
    user = create_user(
        telegram_id=int(telegram_id),
        name=name,
        avatar_url=avatar_url if avatar_url else None
    )
    
    if user:

    else:

def add_user_tokens():
    """Добавление токенов пользователю."""

    telegram_id = input("Введи Telegram ID: ").strip()
    amount = input("Введи количество токенов (может быть отрицательным): ").strip()
    
    if not telegram_id.isdigit():

        return
    
    try:
        amount = int(amount)
    except ValueError:

        return
    
    user = add_tokens(int(telegram_id), amount)
    if user:



    else:
        print("❌ Ошибка при добавлении токенов (возможно, пользователь не найден)")


def add_user_rating():
    """Добавление рейтинга пользователю."""

    telegram_id = input("Введи Telegram ID: ").strip()
    amount = input("Введи количество рейтинга (может быть отрицательным): ").strip()
    
    if not telegram_id.isdigit():

        return
    
    try:
        amount = int(amount)
    except ValueError:

        return
    
    user = add_rating(int(telegram_id), amount)
    if user:



    else:
        print("❌ Ошибка при добавлении рейтинга (возможно, пользователь не найден)")


def show_leaderboard():
    """Показать полную таблицу лидеров."""

    leaders = get_leaderboard(50)
    
    if not leaders:

        return
    
    print(f"\nВсего пользователей: {len(leaders)}\n")
    for i, leader in enumerate(leaders, 1):
        medal = ""
        if i == 1:
            medal = "💎"
        elif i == 2:
            medal = "🥇"
        elif i == 3:
            medal = "🥈"

def show_top_10():
    """Показать топ-10 лидеров."""

    leaders = get_leaderboard(10)
    
    if not leaders:

        return

    for i, leader in enumerate(leaders, 1):
        medal = ""
        if i == 1:
            medal = "💎"
        elif i == 2:
            medal = "🥇"
        elif i == 3:
            medal = "🥈"

if __name__ == "__main__":
    main_menu()
