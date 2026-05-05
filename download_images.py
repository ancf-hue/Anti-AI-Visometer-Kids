import os
from datasets import load_dataset
from PIL import Image
import requests
from io import BytesIO

# ========== НАСТРОЙКИ ==========
LIMIT = 20
REAL_DIR = "images/real"
AI_DIR = "images/ai"

# Создаём папки
os.makedirs(REAL_DIR, exist_ok=True)
os.makedirs(AI_DIR, exist_ok=True)

print("📥 Загрузка датасета 'Parveshiiii/AI-vs-Real'...")

try:
    dataset = load_dataset("Parveshiiii/AI-vs-Real", split="train")
    print(f"✅ Датасет загружен! Всего записей: {len(dataset)}")
    
    # Проверяем структуру меток
    print("\n📋 Информация о датасете:")
    print(f"   Доступные ключи: {list(dataset[0].keys())}")
    
    if 'label' in dataset[0]:
        print(f"   Тип метки: {type(dataset[0]['label'])}")
        print(f"   Пример метки: {dataset[0]['label']}")
        
        # Определяем что есть что
        sample_label = dataset[0]['label']
        if sample_label == 0:
            print("   ⚠️ ВНИМАНИЕ: label=0 - скорее всего FAKE (AI), label=1 - REAL")
            REAL_VALUE = 1
            AI_VALUE = 0
        else:
            print("   ⚠️ ВНИМАНИЕ: label=1 - скорее всего FAKE (AI), label=0 - REAL")
            REAL_VALUE = 0
            AI_VALUE = 1
    else:
        print("   ⚠️ Ключ 'label' не найден, пробуем 'labels'...")
        REAL_VALUE = 1
        AI_VALUE = 0
        
except Exception as e:
    print(f"❌ Ошибка загрузки датасета: {e}")
    print("\n📌 Альтернативные датасеты:")
    print("   1. dataset = load_dataset('mayuraganesh/real_and_ai_images', split='train')")
    print("   2. dataset = load_dataset('KishoreKumar/AI-vs-Real-Images', split='train')")
    exit(1)

# ========== СОХРАНЕНИЕ ИЗОБРАЖЕНИЙ ==========
real_count = 0
ai_count = 0
skipped = 0

print(f"\n📸 Начинаем загрузку {LIMIT} реальных и {LIMIT} ИИ изображений...")
print("="*50)

for idx, item in enumerate(dataset):
    if real_count >= LIMIT and ai_count >= LIMIT:
        break
    
    try:
        # Получаем изображение
        if 'image' in item:
            image_data = item['image']
        elif 'img' in item:
            image_data = item['img']
        else:
            # Берём первый доступный ключ с изображением
            image_data = next((v for k, v in item.items() if 'image' in k.lower() or 'img' in k.lower()), None)
            if image_data is None:
                continue
        
        # Если изображение в виде URL
        if isinstance(image_data, str) and image_data.startswith('http'):
            response = requests.get(image_data, timeout=10)
            image = Image.open(BytesIO(response.content))
        else:
            image = image_data
        
        # Определяем тип (реальное или ИИ)
        if 'label' in item:
            label_value = item['label']
        elif 'labels' in item:
            label_value = item['labels']
        else:
            label_value = None
        
        # Сохраняем
        if label_value == REAL_VALUE and real_count < LIMIT:
            real_count += 1
            filename = f"{REAL_DIR}/{real_count}.jpg"
            # Конвертируем в RGB если нужно
            if image.mode in ('RGBA', 'P'):
                image = image.convert('RGB')
            image.save(filename, "JPEG", quality=95)
            print(f"   ✅ Реальное [{real_count}/{LIMIT}] сохранено (label={label_value})")
            
        elif label_value == AI_VALUE and ai_count < LIMIT:
            ai_count += 1
            filename = f"{AI_DIR}/{ai_count}.jpg"
            if image.mode in ('RGBA', 'P'):
                image = image.convert('RGB')
            image.save(filename, "JPEG", quality=95)
            print(f"   🤖 ИИ [{ai_count}/{LIMIT}] сохранено (label={label_value})")
            
    except Exception as e:
        skipped += 1
        if skipped <= 5:  # Показываем только первые 5 ошибок
            print(f"   ⚠️ Ошибка на элементе {idx}: {e}")
        continue

# ========== ИТОГИ ==========
print("\n" + "="*50)
print("📊 РЕЗУЛЬТАТЫ ЗАГРУЗКИ")
print("="*50)
print(f"✅ Реальных изображений: {real_count}/{LIMIT}")
print(f"✅ ИИ-изображений: {ai_count}/{LIMIT}")
print(f"⚠️ Пропущено (ошибки): {skipped}")

if real_count < LIMIT:
    print(f"\n⚠️ Предупреждение: не хватает {LIMIT - real_count} реальных изображений")
if ai_count < LIMIT:
    print(f"⚠️ Предупреждение: не хватает {LIMIT - ai_count} ИИ-изображений")
    print("\n💡 Совет: Запустите скрипт ещё раз или используйте другой датасет")

print(f"\n📁 Файлы сохранены в папках:")
print(f"   - {REAL_DIR}/")
print(f"   - {AI_DIR}/")

# ========== СОЗДАЁМ JS-БАЗУ ДАННЫХ ==========
print("\n🔧 Создаём обновлённый script.js с вашими изображениями...")

# Подсказки для обучения
HINTS = [
    "👁️ Смотрите на симметрию зрачков и отражения в них. У ИИ часто асимметричные блики.",
    "👂 ИИ часто ошибается в деталях ушных раковин — ищите странные формы или отсутствие деталей.",
    "💇 Проверьте границы волос — у реальных фото они не должны 'растворяться' в фоне.",
    "🧴 Текстура кожи у ИИ бывает слишком замыленной или пластиковой, без пор и морщин.",
    "🌫️ Ищите артефакты на заднем плане: плывущие линии, странные тени, неестественные текстуры.",
    "🦷 Обратите внимание на зубы — у ИИ они могут быть нереалистично ровными или странной формы.",
    "👃 Проверьте нос: тени под носом должны быть естественными, у ИИ они часто неправильные.",
    "🧥 Одежда и складки — ИИ может создавать анатомически невозможные складки ткани.",
    "🌳 Деревья и растения — нейросети часто генерируют неестественные ветки или листья.",
    "💍 Украшения (серьги, очки) — частая ошибка ИИ: асимметрия или искажение формы.",
    "👆 Количество пальцев — классическая ошибка нейросетей, проверяйте руки!",
    "📝 Текст на заднем плане — ИИ не умеет писать читаемые надписи.",
    "🪞 Отражения в зеркалах и воде — слабое место нейросетей.",
    "🏠 Геометрия зданий — ищите искривлённые линии и невозможные углы.",
    "🐾 Животные: лапы, хвосты, шерсть — нейросети часто ошибаются в анатомии."
]

# Создаём обновлённый script.js
with open("script.js", "w", encoding="utf-8") as f:
    f.write(f"""// ========== АВТОМАТИЧЕСКИ СГЕНЕРИРОВАННАЯ БАЗА ДАННЫХ ==========
// Реальных: {real_count}, ИИ: {ai_count}
// Дата создания: {__import__('datetime').datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

const imageDatabase = {{
    easy: [],
    medium: [],
    hard: []
}};

// Генерация вопросов на основе загруженных изображений
const totalImages = Math.min({real_count}, {ai_count}, 20);
const hintsList = {HINTS};

for (let i = 1; i <= totalImages; i++) {{
    const hintIndex = (i - 1) % hintsList.length;
    
    // Распределяем по уровням сложности
    if (i <= 7) {{
        imageDatabase.easy.push({{
            real: `images/real/${{i}}.jpg`,
            ai: `images/ai/${{i}}.jpg`,
            hint: hintsList[hintIndex]
        }});
    }} else if (i <= 13) {{
        imageDatabase.medium.push({{
            real: `images/real/${{i}}.jpg`,
            ai: `images/ai/${{i}}.jpg`,
            hint: hintsList[hintIndex]
        }});
    }} else {{
        imageDatabase.hard.push({{
            real: `images/real/${{i}}.jpg`,
            ai: `images/ai/${{i}}.jpg`,
            hint: hintsList[hintIndex]
        }});
    }}
}}

// Объединяем все вопросы для 10 раундов
const allQuestions = [
    ...imageDatabase.easy.slice(0, 3),
    ...imageDatabase.medium.slice(0, 4),
    ...imageDatabase.hard.slice(0, 3)
];

console.log('✅ База загружена:', allQuestions.length, 'вопросов');
console.log('   Легких:', imageDatabase.easy.length);
console.log('   Средних:', imageDatabase.medium.length);
console.log('   Сложных:', imageDatabase.hard.length);
""")

print("✅ Создан обновлённый script.js")

# ========== СОЗДАЁМ ПРОВЕРОЧНЫЙ HTML ==========
print("\n🔍 Создаём проверочный HTML-файл...")

check_html = f"""<!DOCTYPE html>
<html>
<head>
    <title>Проверка изображений Визометра</title>
    <style>
        body {{ font-family: monospace; padding: 20px; background: #1a1a2e; color: white; }}
        h1, h2 {{ color: #00f2fe; }}
        .gallery {{ display: flex; flex-wrap: wrap; gap: 10px; }}
        .category {{ background: rgba(255,255,255,0.1); padding: 20px; border-radius: 15px; margin-bottom: 30px; }}
        img {{ width: 150px; height: 150px; object-fit: cover; border-radius: 10px; margin: 5px; }}
        .real {{ border: 2px solid #00ff88; }}
        .ai {{ border: 2px solid #ff4b4b; }}
        .stats {{ margin-top: 20px; padding: 15px; background: rgba(0,0,0,0.5); border-radius: 10px; }}
        .good {{ color: #00ff88; }}
        .bad {{ color: #ff4b4b; }}
    </style>
</head>
<body>
    <h1>👁️ Анти-ИИ Визометр — Проверка изображений</h1>
    
    <div class="category">
        <h2 class="good">✅ Реальные фото ({real_count})</h2>
        <div class="gallery">
"""

for i in range(1, min(real_count, 20) + 1):
    check_html += f'<img src="{REAL_DIR}/{i}.jpg" class="real" onerror="this.src=\'https://via.placeholder.com/150?text=Missing\'">'

check_html += f"""
        </div>
    </div>
    
    <div class="category">
        <h2 class="bad">🤖 ИИ-генерации ({ai_count})</h2>
        <div class="gallery">
"""

for i in range(1, min(ai_count, 20) + 1):
    check_html += f'<img src="{AI_DIR}/{i}.jpg" class="ai" onerror="this.src=\'https://via.placeholder.com/150?text=Missing\'">'

check_html += f"""
        </div>
    </div>
    
    <div class="stats">
        <h3>📊 Статус готовности</h3>
        <p>✅ Реальные изображения: {real_count}/20 {"✔️" if real_count >= 20 else "❌"}</p>
        <p>✅ ИИ-изображения: {ai_count}/20 {"✔️" if ai_count >= 20 else "❌"}</p>
        <p>📁 Используется {min(real_count, ai_count, 20)} пар изображений</p>
        {"<p class='good'>🎉 Проект готов к запуску! Откройте index.html</p>" if real_count >= 20 and ai_count >= 20 else "<p class='bad'>⚠️ Изображений недостаточно. Запустите скрипт ещё раз или используйте другой датасет.</p>"}
    </div>
</body>
</html>
"""

with open("check_images.html", "w", encoding="utf-8") as f:
    f.write(check_html)

print("✅ Создан файл check_images.html — откройте его в браузере для проверки")

# ========== ФИНАЛЬНЫЙ ИТОГ ==========
print("\n" + "="*50)
print("🎉 ЗАВЕРШЕНО!")
print("="*50)
print("\n📋 Что сделано:")
print("   1. Загружены изображения из датасета")
print("   2. Создан обновлённый script.js с вашими данными")
print("   3. Создан check_images.html для проверки")
print("\n🚀 Следующие шаги:")
print("   1. Откройте check_images.html — убедитесь, что все изображения загружены")
print("   2. Откройте index.html — наслаждайтесь тестом!")
print("\n💡 Если изображений меньше 20:")
print("   - Запустите скрипт ещё раз (могут быть новые фото)")
print("   - Используйте альтернативный датасет")
print("   - Добавьте фото вручную из Unsplash/Pexels")