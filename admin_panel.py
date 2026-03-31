"""
Админ-панель для управления пользователями Campus Navigator.
"""

from api_client import CampusAPI


def print_menu():
    print("\n" + "="*50)
    print("АДМИН-ПАНЕЛЬ CAMPUS NAVIGATOR")
    print("="*50)
    print("1. Просмотреть пользователя")
    print("2. Создать/обновить пользователя")
    print("3. Добавить токены")
    print("4. Добавить рейтинг")
    print("5. Показать таблицу лидеров")
    print("6. Показать топ-10")
    print("0. Выход")
    print("="*50)


def view_user(api: CampusAPI):
    telegram_id = int(input("Введите Telegram ID пользователя: "))
    user = api.get_user(telegram_id)
    
    if user:
        print("\n" + "-"*50)
        print(f"Telegram ID: {user['telegram_id']}")
        print(f"Имя: {user['name']}")
        print(f"Токены: {user['tokens']}")
        print(f"Рейтинг: {user['rating']}")
        print(f"Аватар: {user.get('avatar_url', 'Нет')}")
        print(f"Создан: {user['created_at']}")
        print(f"Последняя активность: {user['last_active']}")
        print("-"*50)
    else:
        print("❌ Пользователь не найден")


def create_user(api: CampusAPI):
    telegram_id = int(input("Введите Telegram ID: "))
    name = input("Введите имя пользователя: ")
    avatar_url = input("Введите URL аватара (или Enter для пропуска): ").strip()
    
    if not avatar_url:
        avatar_url = None
    
    user = api.create_user(telegram_id, name, avatar_url)
    if user:
        print(f"✅ Пользователь создан/обновлен: {user['name']}")
    else:
        print("❌ Ошибка создания пользователя")


def add_tokens(api: CampusAPI):
    telegram_id = int(input("Введите Telegram ID: "))
    amount = int(input("Введите количество токенов для добавления: "))
    
    user = api.add_tokens(telegram_id, amount)
    if user:
        print(f"✅ Добавлено {amount} токенов. Всего: {user['tokens']}")
    else:
        print("❌ Ошибка добавления токенов")


def add_rating(api: CampusAPI):
    telegram_id = int(input("Введите Telegram ID: "))
    amount = int(input("Введите количество рейтинга для добавления: "))
    
    user = api.add_rating(telegram_id, amount)
    if user:
        print(f"✅ Добавлено {amount} рейтинга. Всего: {user['rating']}")
    else:
        print("❌ Ошибка добавления рейтинга")


def show_leaderboard(api: CampusAPI, limit: int = 50):
    leaders = api.get_leaderboard(limit)
    
    if not leaders:
        print("❌ Нет данных в таблице лидеров")
        return
    
    print(f"\n{'='*70}")
    print(f"ТАБЛИЦА ЛИДЕРОВ (Топ-{len(leaders)})")
    print(f"{'='*70}")
    print(f"{'#':<5} {'Имя':<25} {'Рейтинг':<15} {'Токены':<10}")
    print(f"{'-'*70}")
    
    for i, leader in enumerate(leaders, 1):
        medal = ""
        if i == 1:
            medal = "💎"
        elif i == 2:
            medal = "🥇"
        elif i == 3:
            medal = "🥈"
        
        print(f"{i:<5} {leader['name']:<25} {leader['rating']:<15} {leader['tokens']:<10} {medal}")
    
    print(f"{'='*70}\n")


def main():
    api = CampusAPI()
    
    while True:
        print_menu()
        choice = input("\nВыберите действие: ").strip()
        
        try:
            if choice == "1":
                view_user(api)
            elif choice == "2":
                create_user(api)
            elif choice == "3":
                add_tokens(api)
            elif choice == "4":
                add_rating(api)
            elif choice == "5":
                show_leaderboard(api, 50)
            elif choice == "6":
                show_leaderboard(api, 10)
            elif choice == "0":
                print("👋 До свидания!")
                break
            else:
                print("❌ Неверный выбор")
        except ValueError:
            print("❌ Ошибка ввода. Проверьте данные.")
        except KeyboardInterrupt:
            print("\n👋 До свидания!")
            break
        except Exception as e:
            print(f"❌ Ошибка: {e}")


if __name__ == "__main__":
    main()
