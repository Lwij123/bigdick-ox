/* 生日封面 · 一屏一张，底部「下一个」翻页，视频播放时放背景音乐 */
(function () {
  'use strict';

  var stage  = document.getElementById('stage');
  var slides = Array.prototype.slice.call(document.querySelectorAll('.slide'));
  var video  = document.getElementById('video');
  var bgm    = document.getElementById('bgm');
  var nextBtn = document.getElementById('next');
  var muteBtn = document.getElementById('mute');

  var index   = 0;
  var musicOn = true;      // 用户没主动关掉音乐
  var musicOk = false;     // 找到音频文件了没

  /* ---------- 翻页 ---------- */
  function show(i) {
    i = (i + slides.length) % slides.length;
    if (i === index) return;

    slides[index].classList.remove('is-active');
    index = i;
    var cur = slides[index];
    cur.classList.add('is-active');

    // 离开视频那张，视频和音乐一起停
    if (cur.dataset.type !== 'video') {
      stopAll();
    }
  }

  function next() { show(index + 1); }

  function stopAll() {
    if (!video.paused) { video.pause(); }
    if (!bgm.paused) { bgm.pause(); }
  }

  nextBtn.addEventListener('click', next);

  document.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Enter') {
      // 视频获焦时别抢空格（那是播放/暂停）
      if (e.target === video) return;
      e.preventDefault();
      next();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      show(index - 1);
    }
  });

  /* ---------- 音乐：视频一播就跟着响，一停就停 ---------- */
  function playMusic() {
    if (!musicOk || !musicOn) return;
    var p = bgm.play();
    if (p && p.catch) { p.catch(function () { /* 浏览器拦自动播放，忽略 */ }); }
  }

  function pauseMusic() {
    if (!bgm.paused) { bgm.pause(); }
  }

  video.addEventListener('play', function () {
    // 有歌的时候把视频原声压下去，别两股声音打架
    if (musicOk && musicOn) { video.volume = 0.25; }
    playMusic();
  });
  video.addEventListener('playing', playMusic);
  video.addEventListener('pause', pauseMusic);
  video.addEventListener('ended', pauseMusic);
  video.addEventListener('seeked', function () { if (!video.paused) { video.volume = 0.25; playMusic(); } });

  /* 右上角按钮：开关音乐 */
  muteBtn.addEventListener('click', function () {
    if (!musicOk) {
      muteBtn.title = '还没找到音频文件：把《戒不掉》的 mp3 改名成 bgm.mp3 放进本文件夹';
      return;
    }
    musicOn = !musicOn;
    muteBtn.setAttribute('aria-pressed', String(!musicOn));
    muteBtn.classList.toggle('is-off', !musicOn);
    muteBtn.textContent = musicOn ? '♪ 戒不掉' : '♪ 已静音';
    if (musicOn) {
      if (!video.paused) { video.volume = 0.25; playMusic(); }
    } else {
      pauseMusic();
    }
  });

  /* ---------- 找音频：同名候选依次试 ---------- */
  var CANDIDATES = ['bgm.mp3', 'bgm.m4a', '戒不掉.mp3', '戒不掉.m4a', 'music.mp3', 'music.m4a'];
  var ci = 0;

  function tryNext() {
    if (ci >= CANDIDATES.length) {
      musicOk = false;
      muteBtn.classList.add('is-missing');
      muteBtn.textContent = '♪ 缺歌曲';
      muteBtn.title = '把《戒不掉》的 mp3 改名成 bgm.mp3 放进本文件夹，刷新即可';
      return;
    }
    bgm.src = CANDIDATES[ci++];
    bgm.load();
  }

  bgm.addEventListener('canplay', function () {
    musicOk = true;
    muteBtn.classList.remove('is-missing');
    muteBtn.textContent = '♪ 戒不掉';
    if (!video.paused) { video.volume = 0.25; playMusic(); }
  });

  bgm.addEventListener('error', function () {
    if (!musicOk) tryNext();
  });

  tryNext();

  /* 页面上按过一次键/点过一次之后，允许后续自动播放不再被拦 */
  function unlock() {
    if (musicOk && !video.paused) playMusic();
  }
  document.addEventListener('pointerdown', unlock, { once: false });

  /* 图片预载，翻页不闪白 */
  slides.forEach(function (s) {
    var img = s.querySelector('img');
    if (img) { var p = new Image(); p.src = img.getAttribute('src'); }
  });
}());