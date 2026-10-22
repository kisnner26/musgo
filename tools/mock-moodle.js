'use strict';
// Moodle falso con datos de ejemplo, solo para sacar capturas sin credenciales reales.
// Uso: node tools/mock-moodle.js  y  MOODLE_URL=http://localhost:8090/ node server.js
const http = require('http');
const now = Math.floor(Date.now() / 1000), d = 86400;
const courses = [
  { id: 11, fullname: 'Ingeniería de Software I', shortname: 'ISW1', progress: 64 },
  { id: 12, fullname: 'Auditoría Informática', shortname: 'AUD', progress: 41 },
  { id: 13, fullname: 'Almacén de Datos', shortname: 'ADD', progress: 78 }
];
const fns = {
  core_webservice_get_site_info: () => ({ userid: 7, fullname: 'Kisnner Obando', username: 'cif2024', sitename: 'UAM Virtual Grado', release: '4.1' }),
  core_message_get_unread_conversations_count: () => 2,
  core_enrol_get_users_courses: () => courses,
  core_course_get_contents: () => [
    { name: 'General', summary: 'Bienvenidos al curso. Revisen el sílabo antes de la primera clase.', modules: [
      { name: 'Foro de avisos', modname: 'forum', instance: 21 },
      { name: 'Sílabo 2026', modname: 'resource', contents: [{ type: 'file', filename: 'silabo-isw1.pdf', fileurl: 'https://uamvirtual.uam.edu.ni/grado/webservice/pluginfile.php/1/silabo.pdf', filesize: 482000 }] }] },
    { name: 'Unidad 2: Requisitos', modules: [
      { name: 'Casos de uso del sistema', modname: 'assign', instance: 31, description: 'Entrega el diagrama de casos de uso con su especificación.' },
      { name: 'Quiz de requisitos', modname: 'quiz', instance: 41 }] }
  ],
  mod_assign_get_assignments: () => ({ courses: [
    { id: 11, shortname: 'ISW1', assignments: [{ id: 31, name: 'Casos de uso del sistema', duedate: now + 2 * d, intro: '<p>Entrega el diagrama de casos de uso con su especificación en PDF.</p>' }] },
    { id: 12, shortname: 'AUD', assignments: [{ id: 32, name: 'Informe de auditoría COBIT', duedate: now + 5 * d }, { id: 33, name: 'Matriz de riesgos', duedate: now - 3 * d }] },
    { id: 13, shortname: 'ADD', assignments: [{ id: 34, name: 'Modelo estrella', duedate: now + 9 * d }] }] }),
  mod_assign_get_submission_status: () => ({ lastattempt: { submission: { status: 'new' }, gradingstatus: 'notgraded', canedit: true } }),
  gradereport_user_get_grade_items: () => ({ usergrades: [{ gradeitems: [
    { itemname: 'Parcial I', gradeformatted: '85.00', grademax: 100, percentageformatted: '85 %' },
    { itemname: 'Casos de uso', gradeformatted: '18.00', grademax: 20, percentageformatted: '90 %' },
    { itemname: null, gradeformatted: '87.40', grademax: 100, percentageformatted: '87 %' }] }] }),
  mod_quiz_get_quizzes_by_courses: () => ({ quizzes: [{ id: 41, name: 'Quiz de requisitos', timeclose: now + 3 * d }] }),
  mod_quiz_get_quiz_access_information: () => ({ canattempt: true, preventnewattemptreasons: [] }),
  mod_quiz_get_user_attempts: () => ({ attempts: [{ attempt: 1, state: 'finished', timestart: now - 6 * d, timefinish: now - 6 * d + 1200, sumgrades: 8.5 }] }),
  mod_forum_get_forums_by_courses: () => [{ id: 21, name: 'Foro de avisos', numdiscussions: 4 }],
  mod_forum_get_forum_discussions_paginated: () => ({ discussions: [
    { discussion: 51, name: 'Cambio de fecha del parcial', userfullname: 'Ing. Martínez', timemodified: now - d, numreplies: 3 },
    { discussion: 52, name: 'Material de la unidad 2', userfullname: 'Ing. Martínez', timemodified: now - 4 * d, numreplies: 0 }] }),
  mod_forum_get_discussion_posts: () => ({ posts: [
    { id: 61, subject: 'Cambio de fecha del parcial', author: { fullname: 'Ing. Martínez' }, timecreated: now - d, message: '<p>El parcial pasa al jueves a las 9:00.</p>' },
    { id: 62, parentid: 61, subject: 'Re: Cambio de fecha del parcial', author: { fullname: 'Ana López' }, timecreated: now - d + 3600, message: 'Gracias, profe.' }] }),
  core_message_get_conversations: () => ({ conversations: [
    { id: 71, name: 'Ana López', unreadcount: 2, messages: [{ text: '¿Ya hiciste la matriz de riesgos?' }] },
    { id: 72, name: 'Grupo ISW1', messages: [{ text: 'Mañana nos vemos en la biblioteca' }] }] }),
  core_message_get_conversation_messages: () => ({ members: [{ id: 9, fullname: 'Ana López' }], messages: [
    { useridfrom: 9, timecreated: now - 7200, text: 'Hola, ¿ya hiciste la matriz de riesgos?' },
    { useridfrom: 7, timecreated: now - 7000, text: 'Casi, te la paso en la noche.' }] }),
  message_popup_get_popup_notifications: () => ({ notifications: [
    { subject: 'Nueva calificación en Parcial I', timecreated: now - 3 * 3600, smallmessage: 'Tu nota ya está publicada.' },
    { subject: 'Tarea por vencer: Casos de uso', timecreated: now - d, smallmessage: 'Vence en 2 días.' }] }),
  core_calendar_get_calendar_monthly_view: () => ({ weeks: [{ days: [{ events: [
    { name: 'Entrega: Casos de uso', timestart: now + 2 * d, course: { shortname: 'ISW1' } },
    { name: 'Parcial II', timestart: now + 6 * d, course: { shortname: 'AUD' } }] }] }] })
};
http.createServer((req, res) => {
  let b = ''; req.on('data', (x) => { b += x; });
  req.on('end', () => {
    const p = new URLSearchParams(b);
    const out = req.url.indexOf('login/token.php') >= 0 ? { token: 'abcdef0123456789' }
      : (fns[p.get('wsfunction')] || (() => ({ exception: 'x', message: 'Sin datos de ejemplo' })))();
    res.writeHead(200, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(out));
  });
}).listen(8090);
