#!/usr/bin/env node
/* translations.js içine v3 anahtarlarını 12 dile ekler. */
"use strict";
const fs = require("fs");

const NEW = {
  en: {
    searchPlaceholder: "Search tasks…", searchAria: "Search tasks",
    prioNone: "No priority", prioLow: "Low priority", prioMed: "Medium priority", prioHigh: "High priority",
    focusBtnAria: "Focus on this task", focusingOn: "Focusing on", clearFocusAria: "Clear focus task",
    emptySearch: "No tasks match your search.",
    heatmapHeading: "Last 90 days", heatmapAria: "Daily focus heatmap, last 13 weeks",
    dataHeading: "Your data", exportData: "Export backup", importData: "Import backup",
    importDone: "Backup restored.", importInvalid: "This file is not a valid backup.",
    importConfirm: "Importing a backup replaces your current tasks, settings and history. Continue?",
    shortcutsTitle: "Keyboard shortcuts",
    scStartPause: "Start / pause the timer", scNew: "New task",
    scHelp: "Show this help", scEdit: "Edit a task (double-click it)", scClose: "Close"
  },
  tr: {
    searchPlaceholder: "Görevlerde ara…", searchAria: "Görevlerde ara",
    prioNone: "Önceliksiz", prioLow: "Düşük öncelik", prioMed: "Orta öncelik", prioHigh: "Yüksek öncelik",
    focusBtnAria: "Bu göreve odaklan", focusingOn: "Odaklanılan görev", clearFocusAria: "Odak görevini kaldır",
    emptySearch: "Aramanla eşleşen görev yok.",
    heatmapHeading: "Son 90 gün", heatmapAria: "Günlük odak ısı haritası, son 13 hafta",
    dataHeading: "Verilerin", exportData: "Yedek al", importData: "Yedeği yükle",
    importDone: "Yedek geri yüklendi.", importInvalid: "Bu dosya geçerli bir yedek değil.",
    importConfirm: "Yedek yüklemek mevcut görevlerini, ayarlarını ve geçmişini değiştirir. Devam edilsin mi?",
    shortcutsTitle: "Klavye kısayolları",
    scStartPause: "Zamanlayıcıyı başlat / duraklat", scNew: "Yeni görev",
    scHelp: "Bu yardımı göster", scEdit: "Görevi düzenle (çift tıkla)", scClose: "Kapat"
  },
  es: {
    searchPlaceholder: "Buscar tareas…", searchAria: "Buscar tareas",
    prioNone: "Sin prioridad", prioLow: "Prioridad baja", prioMed: "Prioridad media", prioHigh: "Prioridad alta",
    focusBtnAria: "Enfocarse en esta tarea", focusingOn: "En curso", clearFocusAria: "Quitar tarea de foco",
    emptySearch: "Ninguna tarea coincide con tu búsqueda.",
    heatmapHeading: "Últimos 90 días", heatmapAria: "Mapa de calor de enfoque diario, últimas 13 semanas",
    dataHeading: "Tus datos", exportData: "Exportar copia", importData: "Importar copia",
    importDone: "Copia restaurada.", importInvalid: "Este archivo no es una copia válida.",
    importConfirm: "Importar una copia reemplaza tus tareas, ajustes e historial actuales. ¿Continuar?",
    shortcutsTitle: "Atajos de teclado",
    scStartPause: "Iniciar / pausar el temporizador", scNew: "Nueva tarea",
    scHelp: "Mostrar esta ayuda", scEdit: "Editar una tarea (doble clic)", scClose: "Cerrar"
  },
  fr: {
    searchPlaceholder: "Rechercher des tâches…", searchAria: "Rechercher des tâches",
    prioNone: "Sans priorité", prioLow: "Priorité basse", prioMed: "Priorité moyenne", prioHigh: "Priorité haute",
    focusBtnAria: "Se concentrer sur cette tâche", focusingOn: "En cours", clearFocusAria: "Retirer la tâche ciblée",
    emptySearch: "Aucune tâche ne correspond à votre recherche.",
    heatmapHeading: "90 derniers jours", heatmapAria: "Carte de chaleur de concentration quotidienne, 13 dernières semaines",
    dataHeading: "Vos données", exportData: "Exporter une sauvegarde", importData: "Importer une sauvegarde",
    importDone: "Sauvegarde restaurée.", importInvalid: "Ce fichier n'est pas une sauvegarde valide.",
    importConfirm: "Importer une sauvegarde remplace vos tâches, réglages et historique actuels. Continuer ?",
    shortcutsTitle: "Raccourcis clavier",
    scStartPause: "Démarrer / mettre en pause le minuteur", scNew: "Nouvelle tâche",
    scHelp: "Afficher cette aide", scEdit: "Modifier une tâche (double-clic)", scClose: "Fermer"
  },
  de: {
    searchPlaceholder: "Aufgaben suchen…", searchAria: "Aufgaben suchen",
    prioNone: "Keine Priorität", prioLow: "Niedrige Priorität", prioMed: "Mittlere Priorität", prioHigh: "Hohe Priorität",
    focusBtnAria: "Auf diese Aufgabe konzentrieren", focusingOn: "Im Fokus", clearFocusAria: "Fokusaufgabe entfernen",
    emptySearch: "Keine Aufgaben entsprechen deiner Suche.",
    heatmapHeading: "Letzte 90 Tage", heatmapAria: "Tägliche Fokus-Heatmap, letzte 13 Wochen",
    dataHeading: "Deine Daten", exportData: "Backup exportieren", importData: "Backup importieren",
    importDone: "Backup wiederhergestellt.", importInvalid: "Diese Datei ist kein gültiges Backup.",
    importConfirm: "Der Import ersetzt deine aktuellen Aufgaben, Einstellungen und deinen Verlauf. Fortfahren?",
    shortcutsTitle: "Tastenkürzel",
    scStartPause: "Timer starten / pausieren", scNew: "Neue Aufgabe",
    scHelp: "Diese Hilfe anzeigen", scEdit: "Aufgabe bearbeiten (Doppelklick)", scClose: "Schließen"
  },
  pt: {
    searchPlaceholder: "Pesquisar tarefas…", searchAria: "Pesquisar tarefas",
    prioNone: "Sem prioridade", prioLow: "Prioridade baixa", prioMed: "Prioridade média", prioHigh: "Prioridade alta",
    focusBtnAria: "Focar nesta tarefa", focusingOn: "Em foco", clearFocusAria: "Remover tarefa em foco",
    emptySearch: "Nenhuma tarefa corresponde à sua pesquisa.",
    heatmapHeading: "Últimos 90 dias", heatmapAria: "Mapa de calor de foco diário, últimas 13 semanas",
    dataHeading: "Seus dados", exportData: "Exportar backup", importData: "Importar backup",
    importDone: "Backup restaurado.", importInvalid: "Este arquivo não é um backup válido.",
    importConfirm: "Importar um backup substitui suas tarefas, configurações e histórico atuais. Continuar?",
    shortcutsTitle: "Atalhos de teclado",
    scStartPause: "Iniciar / pausar o temporizador", scNew: "Nova tarefa",
    scHelp: "Mostrar esta ajuda", scEdit: "Editar uma tarefa (clique duplo)", scClose: "Fechar"
  },
  it: {
    searchPlaceholder: "Cerca attività…", searchAria: "Cerca attività",
    prioNone: "Nessuna priorità", prioLow: "Priorità bassa", prioMed: "Priorità media", prioHigh: "Priorità alta",
    focusBtnAria: "Concentrati su questa attività", focusingOn: "In corso", clearFocusAria: "Rimuovi attività in evidenza",
    emptySearch: "Nessuna attività corrisponde alla tua ricerca.",
    heatmapHeading: "Ultimi 90 giorni", heatmapAria: "Mappa di calore della concentrazione quotidiana, ultime 13 settimane",
    dataHeading: "I tuoi dati", exportData: "Esporta backup", importData: "Importa backup",
    importDone: "Backup ripristinato.", importInvalid: "Questo file non è un backup valido.",
    importConfirm: "L'importazione sostituisce le tue attività, impostazioni e cronologia attuali. Continuare?",
    shortcutsTitle: "Scorciatoie da tastiera",
    scStartPause: "Avvia / metti in pausa il timer", scNew: "Nuova attività",
    scHelp: "Mostra questo aiuto", scEdit: "Modifica un'attività (doppio clic)", scClose: "Chiudi"
  },
  hi: {
    searchPlaceholder: "कार्य खोजें…", searchAria: "कार्य खोजें",
    prioNone: "कोई प्राथमिकता नहीं", prioLow: "कम प्राथमिकता", prioMed: "मध्यम प्राथमिकता", prioHigh: "उच्च प्राथमिकता",
    focusBtnAria: "इस कार्य पर ध्यान केंद्रित करें", focusingOn: "चल रहा है", clearFocusAria: "फ़ोकस कार्य हटाएँ",
    emptySearch: "आपकी खोज से कोई कार्य मेल नहीं खाता।",
    heatmapHeading: "पिछले 90 दिन", heatmapAria: "दैनिक फ़ोकस हीटमैप, पिछले 13 सप्ताह",
    dataHeading: "आपका डेटा", exportData: "बैकअप निर्यात करें", importData: "बैकअप आयात करें",
    importDone: "बैकअप पुनर्स्थापित हो गया।", importInvalid: "यह फ़ाइल वैध बैकअप नहीं है।",
    importConfirm: "बैकअप आयात करने से आपके वर्तमान कार्य, सेटिंग्स और इतिहास बदल जाएँगे। जारी रखें?",
    shortcutsTitle: "कीबोर्ड शॉर्टकट",
    scStartPause: "टाइमर शुरू / रोकें", scNew: "नया कार्य",
    scHelp: "यह सहायता दिखाएँ", scEdit: "कार्य संपादित करें (डबल-क्लिक)", scClose: "बंद करें"
  },
  ar: {
    searchPlaceholder: "ابحث في المهام…", searchAria: "ابحث في المهام",
    prioNone: "بلا أولوية", prioLow: "أولوية منخفضة", prioMed: "أولوية متوسطة", prioHigh: "أولوية عالية",
    focusBtnAria: "التركيز على هذه المهمة", focusingOn: "قيد التركيز", clearFocusAria: "إزالة مهمة التركيز",
    emptySearch: "لا توجد مهام مطابقة لبحثك.",
    heatmapHeading: "آخر ٩٠ يومًا", heatmapAria: "خريطة حرارية للتركيز اليومي، آخر ١٣ أسبوعًا",
    dataHeading: "بياناتك", exportData: "تصدير نسخة احتياطية", importData: "استيراد نسخة احتياطية",
    importDone: "تمت استعادة النسخة الاحتياطية.", importInvalid: "هذا الملف ليس نسخة احتياطية صالحة.",
    importConfirm: "استيراد النسخة الاحتياطية سيستبدل مهامك وإعداداتك وسجلّك الحالي. هل تريد المتابعة؟",
    shortcutsTitle: "اختصارات لوحة المفاتيح",
    scStartPause: "بدء / إيقاف المؤقت مؤقتًا", scNew: "مهمة جديدة",
    scHelp: "إظهار هذه المساعدة", scEdit: "تحرير مهمة (نقر مزدوج)", scClose: "إغلاق"
  },
  zh: {
    searchPlaceholder: "搜索任务…", searchAria: "搜索任务",
    prioNone: "无优先级", prioLow: "低优先级", prioMed: "中优先级", prioHigh: "高优先级",
    focusBtnAria: "专注此任务", focusingOn: "正在专注", clearFocusAria: "取消专注任务",
    emptySearch: "没有符合搜索的任务。",
    heatmapHeading: "过去 90 天", heatmapAria: "每日专注热力图，最近 13 周",
    dataHeading: "你的数据", exportData: "导出备份", importData: "导入备份",
    importDone: "备份已恢复。", importInvalid: "该文件不是有效的备份。",
    importConfirm: "导入备份将替换你当前的任务、设置和历史记录。继续吗？",
    shortcutsTitle: "键盘快捷键",
    scStartPause: "开始 / 暂停计时器", scNew: "新任务",
    scHelp: "显示此帮助", scEdit: "编辑任务（双击）", scClose: "关闭"
  },
  ja: {
    searchPlaceholder: "タスクを検索…", searchAria: "タスクを検索",
    prioNone: "優先度なし", prioLow: "優先度：低", prioMed: "優先度：中", prioHigh: "優先度：高",
    focusBtnAria: "このタスクに集中", focusingOn: "集中中", clearFocusAria: "集中タスクを解除",
    emptySearch: "検索に一致するタスクはありません。",
    heatmapHeading: "過去90日間", heatmapAria: "毎日の集中ヒートマップ（過去13週間）",
    dataHeading: "データ", exportData: "バックアップを書き出す", importData: "バックアップを読み込む",
    importDone: "バックアップを復元しました。", importInvalid: "有効なバックアップファイルではありません。",
    importConfirm: "バックアップの読み込みにより、現在のタスク・設定・履歴が置き換えられます。続けますか？",
    shortcutsTitle: "キーボードショートカット",
    scStartPause: "タイマーの開始 / 一時停止", scNew: "新しいタスク",
    scHelp: "このヘルプを表示", scEdit: "タスクを編集（ダブルクリック）", scClose: "閉じる"
  },
  ru: {
    searchPlaceholder: "Поиск задач…", searchAria: "Поиск задач",
    prioNone: "Без приоритета", prioLow: "Низкий приоритет", prioMed: "Средний приоритет", prioHigh: "Высокий приоритет",
    focusBtnAria: "Сосредоточиться на этой задаче", focusingOn: "В фокусе", clearFocusAria: "Убрать задачу из фокуса",
    emptySearch: "Нет задач, соответствующих вашему поиску.",
    heatmapHeading: "Последние 90 дней", heatmapAria: "Тепловая карта ежедневной концентрации, последние 13 недель",
    dataHeading: "Ваши данные", exportData: "Экспортировать резервную копию", importData: "Импортировать резервную копию",
    importDone: "Резервная копия восстановлена.", importInvalid: "Этот файл не является корректной резервной копией.",
    importConfirm: "Импорт резервной копии заменит ваши текущие задачи, настройки и историю. Продолжить?",
    shortcutsTitle: "Горячие клавиши",
    scStartPause: "Запустить / приостановить таймер", scNew: "Новая задача",
    scHelp: "Показать эту справку", scEdit: "Изменить задачу (двойной клик)", scClose: "Закрыть"
  }
};

const path = process.argv[2] || "translations.js";
const src = fs.readFileSync(path, "utf8");
const lines = src.split("\n");

let current = null;
let blockEnd = -1;
const out = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const m = line.match(/^    ([a-z]{2}): \{$/);
  if (m) { current = m[1]; blockEnd = -1; }
  if (current && /^    \},?$/.test(line)) blockEnd = i;

  if (blockEnd === i && current && NEW[current]) {
    // önceki satırın sonuna virgül ekle (sonda virgül yoksa)
    const prev = out[out.length - 1];
    if (prev && !/[,{[]$/.test(prev)) out[out.length - 1] = prev + ",";
    out.push("      /* --- v3: arama, öncelik, odak görevi, ısı haritası, yedek, kısayollar --- */");
    const entries = Object.entries(NEW[current]);
    for (let j = 0; j < entries.length; j += 3) {
      const chunk = entries.slice(j, j + 3)
        .map(([k, v]) => `${k}: ${JSON.stringify(v)}`).join(", ");
      out.push("      " + chunk + (j + 3 < entries.length ? "," : ""));
    }
    current = null;
  }
  out.push(line);
}

fs.writeFileSync(path, out.join("\n"));
console.log("OK — yeni anahtarlar eklendi.");
