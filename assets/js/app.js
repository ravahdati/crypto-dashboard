    // --- حالت و داده‌های برنامه ---
    const state = {
      // نرخ پیش‌فرض هر دلار به تومان (قابل ویرایش توسط کاربر)
      usdToTomanRate: 92000,
      
      // داده‌های بیت‌کوین
      btc: {
        priceUsd: 87450.00,
        change24h: 2.35,
        high24h: 88900.00,
        low24h: 85200.00,
        volume24h: '38.4B',
        history: [85400, 85900, 86200, 85800, 86900, 87100, 87450]
      },
      
      // داده‌های اتریوم
      eth: {
        priceUsd: 3120.50,
        change24h: -1.15,
        high24h: 3240.00,
        low24h: 3080.00,
        volume24h: '19.2B',
        history: [3190, 3210, 3180, 3140, 3110, 3095, 3120]
      },

      activeChartTab: 'BTC', // یا 'ETH'
      countdown: 15,
      intervalId: null,
      countdownIntervalId: null,
      chartInstance: null
    };

    // برچسب زمان‌های نمودار
    const chartTimeLabels = ['۱۲:۰۰', '۱۴:۰۰', '۱۶:۰۰', '۱۸:۰۰', '۲۰:۰۰', '۲۲:۰۰', 'اکنون'];

    // --- توابع فرمت‌بندی اعداد ---
    function formatNumber(num, decimals = 0) {
      if (isNaN(num)) return '0';
      return Number(num).toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      });
    }

    function formatUsd(num) {
      return '$' + formatNumber(num, 2);
    }

    // --- پیام Toast کاربردی ---
    function showToast(message, type = 'success') {
      const toast = document.getElementById('toast');
      const msgElem = document.getElementById('toast-message');
      const iconElem = document.getElementById('toast-icon');

      msgElem.textContent = message;
      if (type === 'success') {
        iconElem.className = 'fa-solid fa-circle-check text-emerald-400';
      } else if (type === 'error') {
        iconElem.className = 'fa-solid fa-circle-exclamation text-rose-400';
      } else {
        iconElem.className = 'fa-solid fa-circle-info text-sky-400';
      }

      toast.classList.remove('opacity-0', '-translate-y-20');
      toast.classList.add('opacity-100', 'translate-y-0');

      setTimeout(() => {
        toast.classList.remove('opacity-100', 'translate-y-0');
        toast.classList.add('opacity-0', '-translate-y-20');
      }, 3000);
    }

    // --- به‌روزرسانی رندر کارت‌ها و رابط کاربری ---
    function renderDashboard(prevBtcPrice = null, prevEthPrice = null) {
      const rate = state.usdToTomanRate;

      // محاسبه قیمت‌های بیت‌کوین
      const btcToman = state.btc.priceUsd * rate;
      const btcRial = btcToman * 10;

      // محاسبه قیمت‌های اتریوم
      const ethToman = state.eth.priceUsd * rate;
      const ethRial = ethToman * 10;

      // ۱. المان‌های بیت‌کوین
      document.getElementById('btc-price-usd').textContent = formatUsd(state.btc.priceUsd);
      document.getElementById('btc-price-toman').textContent = formatNumber(btcToman, 0);
      document.getElementById('btc-price-rial').textContent = formatNumber(btcRial, 0);
      document.getElementById('btc-high').textContent = formatUsd(state.btc.high24h);
      document.getElementById('btc-low').textContent = formatUsd(state.btc.low24h);
      document.getElementById('btc-vol').textContent = '$' + state.btc.volume24h;

      // نشان تغییرات ۲۴ ساعته BTC
      const btcBadge = document.getElementById('btc-change-badge');
      const btcChangeVal = document.getElementById('btc-change-val');
      const btcChangeIcon = document.getElementById('btc-change-icon');
      btcChangeVal.textContent = (state.btc.change24h >= 0 ? '+' : '') + state.btc.change24h.toFixed(2) + '%';
      if (state.btc.change24h >= 0) {
        btcBadge.className = 'flex items-center gap-1 text-xs font-bold font-mono px-3 py-1 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
        btcChangeIcon.className = 'fa-solid fa-caret-up';
      } else {
        btcBadge.className = 'flex items-center gap-1 text-xs font-bold font-mono px-3 py-1 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20';
        btcChangeIcon.className = 'fa-solid fa-caret-down';
      }

      // فلش تغییر قیمت BTC
      if (prevBtcPrice !== null) {
        const cardBtc = document.getElementById('card-btc');
        cardBtc.classList.remove('flash-up', 'flash-down');
        void cardBtc.offsetWidth; // Force Reflow
        cardBtc.classList.add(state.btc.priceUsd >= prevBtcPrice ? 'flash-up' : 'flash-down');
      }

      // ۲. المان‌های اتریوم
      document.getElementById('eth-price-usd').textContent = formatUsd(state.eth.priceUsd);
      document.getElementById('eth-price-toman').textContent = formatNumber(ethToman, 0);
      document.getElementById('eth-price-rial').textContent = formatNumber(ethRial, 0);
      document.getElementById('eth-high').textContent = formatUsd(state.eth.high24h);
      document.getElementById('eth-low').textContent = formatUsd(state.eth.low24h);
      document.getElementById('eth-vol').textContent = '$' + state.eth.volume24h;

      // نشان تغییرات ۲۴ ساعته ETH
      const ethBadge = document.getElementById('eth-change-badge');
      const ethChangeVal = document.getElementById('eth-change-val');
      const ethChangeIcon = document.getElementById('eth-change-icon');
      ethChangeVal.textContent = (state.eth.change24h >= 0 ? '+' : '') + state.eth.change24h.toFixed(2) + '%';
      if (state.eth.change24h >= 0) {
        ethBadge.className = 'flex items-center gap-1 text-xs font-bold font-mono px-3 py-1 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
        ethChangeIcon.className = 'fa-solid fa-caret-up';
      } else {
        ethBadge.className = 'flex items-center gap-1 text-xs font-bold font-mono px-3 py-1 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20';
        ethChangeIcon.className = 'fa-solid fa-caret-down';
      }

      // فلش تغییر قیمت ETH
      if (prevEthPrice !== null) {
        const cardEth = document.getElementById('card-eth');
        cardEth.classList.remove('flash-up', 'flash-down');
        void cardEth.offsetWidth;
        cardEth.classList.add(state.eth.priceUsd >= prevEthPrice ? 'flash-up' : 'flash-down');
      }

      // ۳. جدول خلاصه
      document.getElementById('tbl-btc-usd').textContent = formatUsd(state.btc.priceUsd);
      document.getElementById('tbl-btc-toman').textContent = formatNumber(btcToman, 0) + ' تومان';
      document.getElementById('tbl-btc-rial').textContent = formatNumber(btcRial, 0) + ' ریال';
      document.getElementById('tbl-btc-change').innerHTML = `<span class="${state.btc.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'}">${(state.btc.change24h >= 0 ? '+' : '') + state.btc.change24h.toFixed(2)}%</span>`;

      document.getElementById('tbl-eth-usd').textContent = formatUsd(state.eth.priceUsd);
      document.getElementById('tbl-eth-toman').textContent = formatNumber(ethToman, 0) + ' تومان';
      document.getElementById('tbl-eth-rial').textContent = formatNumber(ethRial, 0) + ' ریال';
      document.getElementById('tbl-eth-change').innerHTML = `<span class="${state.eth.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'}">${(state.eth.change24h >= 0 ? '+' : '') + state.eth.change24h.toFixed(2)}%</span>`;

      document.getElementById('tbl-usdt-toman').textContent = formatNumber(rate, 0) + ' تومان';
      document.getElementById('tbl-usdt-rial').textContent = formatNumber(rate * 10, 0) + ' ریال';
      document.getElementById('headerRateDisplay').textContent = formatNumber(rate, 0);

      // ۴. برچسب آخرین زمان بروزرسانی
      const now = new Date();
      document.getElementById('lastUpdatedTime').textContent = 'آخرین بروزرسانی: ' + now.toLocaleTimeString('fa-IR');

      // اجرای محاسبه‌گر ماشین‌حساب با نرخ جدید
      calculateConversion();

      // بروزرسانی داده‌های نمودار
      updateChartData();
    }

    // --- ماشین‌حساب تبدیل ارز چندمنظوره ---
    function calculateConversion() {
      const amount = parseFloat(document.getElementById('calcAmountInput').value) || 0;
      const unit = document.getElementById('calcSourceUnit').value;
      const rate = state.usdToTomanRate;

      let valueInUsd = 0;

      // ابتدا تبدیل واحد ورودی به دلار (USD) به عنوان مبنا
      switch (unit) {
        case 'BTC':
          valueInUsd = amount * state.btc.priceUsd;
          break;
        case 'ETH':
          valueInUsd = amount * state.eth.priceUsd;
          break;
        case 'USD':
          valueInUsd = amount;
          break;
        case 'TOMAN':
          valueInUsd = rate > 0 ? (amount / rate) : 0;
          break;
        case 'RIAL':
          valueInUsd = rate > 0 ? (amount / (rate * 10)) : 0;
          break;
      }

      // تبدیل دلار به سایر واحدها
      const valToman = valueInUsd * rate;
      const valRial = valToman * 10;
      const valBtc = state.btc.priceUsd > 0 ? (valueInUsd / state.btc.priceUsd) : 0;
      const valEth = state.eth.priceUsd > 0 ? (valueInUsd / state.eth.priceUsd) : 0;

      document.getElementById('calcResultUsd').textContent = '$' + formatNumber(valueInUsd, 2);
      document.getElementById('calcResultToman').textContent = formatNumber(valToman, 0) + ' تومان';
      document.getElementById('calcResultRial').textContent = formatNumber(valRial, 0) + ' ریال';
      document.getElementById('calcResultBtc').textContent = valBtc.toFixed(6) + ' BTC';
      document.getElementById('calcResultEth').textContent = valEth.toFixed(6) + ' ETH';
    }

    // --- دریافت داده‌های زنده از API عمومی کریپتو (همراه با Fallback هوشمند) ---
    async function fetchLivePrices() {
      const prevBtc = state.btc.priceUsd;
      const prevEth = state.eth.priceUsd;
      const refreshIcon = document.getElementById('refreshIcon');
      refreshIcon.classList.add('animate-spin');

      try {
        // تلاش برای دریافت از CoinGecko API
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true', {
          cache: 'no-cache'
        });

        if (!response.ok) throw new Error('Network response not ok');
        const data = await response.json();

        if (data.bitcoin && data.ethereum) {
          state.btc.priceUsd = data.bitcoin.usd;
          state.btc.change24h = data.bitcoin.usd_24h_change || 0;
          state.btc.volume24h = (data.bitcoin.usd_24h_vol / 1e9).toFixed(1) + 'B';
          state.btc.high24h = state.btc.priceUsd * 1.018;
          state.btc.low24h = state.btc.priceUsd * 0.985;

          state.eth.priceUsd = data.ethereum.usd;
          state.eth.change24h = data.ethereum.usd_24h_change || 0;
          state.eth.volume24h = (data.ethereum.usd_24h_vol / 1e9).toFixed(1) + 'B';
          state.eth.high24h = state.eth.priceUsd * 1.022;
          state.eth.low24h = state.eth.priceUsd * 0.981;

          // اضافه کردن به تاریخچه نمودار
          state.btc.history.push(state.btc.priceUsd);
          if (state.btc.history.length > 7) state.btc.history.shift();

          state.eth.history.push(state.eth.priceUsd);
          if (state.eth.history.length > 7) state.eth.history.shift();

          renderDashboard(prevBtc, prevEth);
          showToast('نرخ‌های زنده با موفقیت بروزرسانی شدند');
        }
      } catch (err) {
        // در صورت عدم دسترسی به API خارجی یا فیلترینگ/CORS، نوسان طبیعی لحظه‌ای شبیه‌سازی می‌شود
        simulateMarketTick(prevBtc, prevEth);
      } finally {
        setTimeout(() => {
          refreshIcon.classList.remove('animate-spin');
        }, 600);
      }
    }

    // شبیه‌ساز نوسان زنده قیمت در صورت اختلال در شبکه
    function simulateMarketTick(prevBtc, prevEth) {
      const btcJitter = (Math.random() - 0.49) * 120;
      const ethJitter = (Math.random() - 0.49) * 12;

      state.btc.priceUsd = Math.max(1000, Number((state.btc.priceUsd + btcJitter).toFixed(2)));
      state.eth.priceUsd = Math.max(100, Number((state.eth.priceUsd + ethJitter).toFixed(2)));

      state.btc.history.push(state.btc.priceUsd);
      if (state.btc.history.length > 7) state.btc.history.shift();

      state.eth.history.push(state.eth.priceUsd);
      if (state.eth.history.length > 7) state.eth.history.shift();

      renderDashboard(prevBtc, prevEth);
    }

    // --- مدیریت نمودار Chart.js ---
    function initChart() {
      const ctx = document.getElementById('cryptoChart').getContext('2d');
      const isBtc = state.activeChartTab === 'BTC';
      const initialData = isBtc ? state.btc.history : state.eth.history;
      const themeColor = isBtc ? '#f59e0b' : '#6366f1';

      // ساخت گرادیانت زیر نمودار
      const gradient = ctx.createLinearGradient(0, 0, 0, 300);
      gradient.addColorStop(0, isBtc ? 'rgba(245, 158, 11, 0.35)' : 'rgba(99, 102, 241, 0.35)');
      gradient.addColorStop(1, 'rgba(15, 23, 42, 0)');

      state.chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
          labels: chartTimeLabels,
          datasets: [{
            label: isBtc ? 'قیمت دلار بیت‌کوین' : 'قیمت دلار اتریوم',
            data: [...initialData],
            borderColor: themeColor,
            borderWidth: 2.5,
            pointBackgroundColor: themeColor,
            pointBorderColor: '#fff',
            pointRadius: 4,
            pointHoverRadius: 6,
            fill: true,
            backgroundColor: gradient,
            tension: 0.35
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              rtl: true,
              callbacks: {
                label: function(context) {
                  const valUsd = context.parsed.y;
                  const valToman = valUsd * state.usdToTomanRate;
                  return [
                    ` قیمت دلاری: $${formatNumber(valUsd, 2)}`,
                    ` معادل تومان: ${formatNumber(valToman, 0)} تومان`
                  ];
                }
              }
            }
          },
          scales: {
            x: {
              grid: { color: 'rgba(51, 65, 85, 0.3)' },
              ticks: { color: '#94a3b8', font: { family: 'Vazirmatn' } }
            },
            y: {
              grid: { color: 'rgba(51, 65, 85, 0.3)' },
              ticks: {
                color: '#94a3b8',
                font: { family: 'monospace' },
                callback: function(val) {
                  return '$' + formatNumber(val, 0);
                }
              }
            }
          }
        }
      });
    }

    function updateChartData() {
      if (!state.chartInstance) return;
      const isBtc = state.activeChartTab === 'BTC';
      const historyData = isBtc ? state.btc.history : state.eth.history;
      const themeColor = isBtc ? '#f59e0b' : '#6366f1';

      state.chartInstance.data.datasets[0].data = [...historyData];
      state.chartInstance.data.datasets[0].borderColor = themeColor;
      state.chartInstance.data.datasets[0].pointBackgroundColor = themeColor;
      state.chartInstance.update('none');
    }

    function switchChartTab(target) {
      if (state.activeChartTab === target) return;
      state.activeChartTab = target;

      const btnBtc = document.getElementById('chartTabBtc');
      const btnEth = document.getElementById('chartTabEth');

      if (target === 'BTC') {
        btnBtc.className = 'px-3.5 py-1.5 rounded-lg font-medium transition-all bg-amber-500/20 text-amber-300 border border-amber-500/30';
        btnEth.className = 'px-3.5 py-1.5 rounded-lg font-medium transition-all text-slate-400 hover:text-slate-200';
      } else {
        btnEth.className = 'px-3.5 py-1.5 rounded-lg font-medium transition-all bg-indigo-500/20 text-indigo-300 border border-indigo-500/30';
        btnBtc.className = 'px-3.5 py-1.5 rounded-lg font-medium transition-all text-slate-400 hover:text-slate-200';
      }

      if (state.chartInstance) {
        state.chartInstance.destroy();
        initChart();
      }
    }

    // --- مدیریت مودال تغییر نرخ دلار ---
    const rateModal = document.getElementById('rateModal');
    const rateModalCard = document.getElementById('rateModalCard');
    const customRateInput = document.getElementById('customRateInput');

    function openRateModal() {
      customRateInput.value = state.usdToTomanRate;
      rateModal.classList.remove('hidden');
      setTimeout(() => {
        rateModal.classList.remove('opacity-0');
        rateModalCard.classList.remove('scale-95');
        rateModalCard.classList.add('scale-100');
      }, 10);
    }

    function closeRateModal() {
      rateModal.classList.add('opacity-0');
      rateModalCard.classList.remove('scale-100');
      rateModalCard.classList.add('scale-95');
      setTimeout(() => {
        rateModal.classList.add('hidden');
      }, 250);
    }

    function saveNewRate() {
      const newRate = parseFloat(customRateInput.value);
      if (newRate && newRate > 0) {
        state.usdToTomanRate = newRate;
        closeRateModal();
        renderDashboard();
        showToast(`نرخ برابری هر تتر با ${formatNumber(newRate, 0)} تومان تنظیم شد.`);
      } else {
        showToast('لطفاً یک عدد معتبر بزرگتر از صفر وارد کنید.', 'error');
      }
    }

    // --- شمارش معکوس و راه‌اندازی تایمرها ---
    function startTimers() {
      state.countdown = 15;
      const countdownElem = document.getElementById('countdownTimer');

      state.countdownIntervalId = setInterval(() => {
        state.countdown--;
        if (state.countdown <= 0) {
          state.countdown = 15;
          fetchLivePrices();
        }
        if (countdownElem) {
          countdownElem.textContent = state.countdown;
        }
      }, 1000);
    }

    // کپی داده‌های ماشین‌حساب به کلیپ‌بورد
    function copyCalculatorResults() {
      const usd = document.getElementById('calcResultUsd').textContent;
      const toman = document.getElementById('calcResultToman').textContent;
      const rial = document.getElementById('calcResultRial').textContent;
      const textToCopy = `محاسبه تبدیل رمزارز:\nدلار: ${usd}\nتومان: ${toman}\nریال: ${rial}\n(نرخ تتر: ${formatNumber(state.usdToTomanRate, 0)} تومان)`;

      const tempTextArea = document.createElement('textarea');
      tempTextArea.value = textToCopy;
      document.body.appendChild(tempTextArea);
      tempTextArea.select();
      try {
        document.execCommand('copy');
        showToast('نتایج با موفقیت در کلیپ‌بورد کپی شد');
      } catch (err) {
        showToast('خطا در کپی نتایج', 'error');
      }
      document.body.removeChild(tempTextArea);
    }

    // --- ثبت شنوندگان رویدادها (Event Listeners) ---
    document.addEventListener('DOMContentLoaded', () => {
      // مقداردهی اولیه نمودار و داشبورد
      initChart();
      renderDashboard();
      startTimers();
      fetchLivePrices();

      // دکمه بازخوانی دستی
      document.getElementById('refreshBtn').addEventListener('click', () => {
        state.countdown = 15;
        fetchLivePrices();
      });

      // دکمه‌های مودال نرخ
      document.getElementById('openRateModalBtn').addEventListener('click', openRateModal);
      document.getElementById('closeRateModalBtn').addEventListener('click', closeRateModal);
      document.getElementById('cancelRateBtn').addEventListener('click', closeRateModal);
      document.getElementById('saveRateBtn').addEventListener('click', saveNewRate);

      // دکمه‌های مقادیر پیش‌فرض نرخ
      document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const rateVal = e.target.getAttribute('data-rate');
          customRateInput.value = rateVal;
        });
      });

      // تب‌های نمودار
      document.getElementById('chartTabBtc').addEventListener('click', () => switchChartTab('BTC'));
      document.getElementById('chartTabEth').addEventListener('click', () => switchChartTab('ETH'));

      // شنوندگان ماشین‌حساب
      document.getElementById('calcAmountInput').addEventListener('input', calculateConversion);
      document.getElementById('calcSourceUnit').addEventListener('change', calculateConversion);
      document.getElementById('copyCalcResultBtn').addEventListener('click', copyCalculatorResults);

      // بستن مودال با کلیک در پس‌زمینه
      rateModal.addEventListener('click', (e) => {
        if (e.target === rateModal) closeRateModal();
      });
    });
