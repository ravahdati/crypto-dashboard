/**
 * نمودار خطی سبک و محلی با رابط مورد نیاز داشبورد.
 * این پیاده‌سازی وابستگی قبلی به Chart.js CDN را حذف می‌کند.
 */
class LocalLineChart {
  constructor(context, config) {
    this.context = context;
    this.canvas = context.canvas;
    this.data = config.data;
    this.options = config.options || {};
    this.resizeObserver = new ResizeObserver(() => this.draw());
    this.resizeObserver.observe(this.canvas.parentElement);
    this.draw();
  }

  update() {
    this.draw();
  }

  destroy() {
    this.resizeObserver.disconnect();
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  draw() {
    const ratio = window.devicePixelRatio || 1;
    const width = this.canvas.clientWidth || this.canvas.parentElement.clientWidth;
    const height = this.canvas.clientHeight || this.canvas.parentElement.clientHeight;
    this.canvas.width = width * ratio;
    this.canvas.height = height * ratio;

    const ctx = this.context;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.clearRect(0, 0, width, height);

    const values = this.data.datasets[0].data.map(Number);
    if (!values.length) return;

    const padding = { top: 20, right: 18, bottom: 36, left: 68 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    const minimum = Math.min(...values);
    const maximum = Math.max(...values);
    const spread = Math.max(maximum - minimum, maximum * 0.01, 1);
    const low = minimum - spread * 0.2;
    const high = maximum + spread * 0.2;
    const x = index => padding.left + (index / Math.max(values.length - 1, 1)) * chartWidth;
    const y = value => padding.top + ((high - value) / (high - low)) * chartHeight;

    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(51, 65, 85, 0.35)';
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px Tahoma, sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    for (let row = 0; row <= 4; row += 1) {
      const rowY = padding.top + (row / 4) * chartHeight;
      ctx.beginPath();
      ctx.moveTo(padding.left, rowY);
      ctx.lineTo(width - padding.right, rowY);
      ctx.stroke();
      const value = high - (row / 4) * (high - low);
      ctx.fillText(`$${Math.round(value).toLocaleString('en-US')}`, padding.left - 8, rowY);
    }

    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    this.data.labels.forEach((label, index) => {
      ctx.fillText(label, x(index), height - padding.bottom + 10);
    });

    const dataset = this.data.datasets[0];
    const fill = ctx.createLinearGradient(0, padding.top, 0, height - padding.bottom);
    const baseColor = dataset.borderColor === '#f59e0b' ? '245, 158, 11' : '99, 102, 241';
    fill.addColorStop(0, `rgba(${baseColor}, 0.32)`);
    fill.addColorStop(1, `rgba(${baseColor}, 0)`);
    ctx.beginPath();
    values.forEach((value, index) => {
      if (index === 0) ctx.moveTo(x(index), y(value));
      else ctx.lineTo(x(index), y(value));
    });
    ctx.lineTo(x(values.length - 1), padding.top + chartHeight);
    ctx.lineTo(x(0), padding.top + chartHeight);
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();

    ctx.beginPath();
    values.forEach((value, index) => {
      if (index === 0) ctx.moveTo(x(index), y(value));
      else ctx.lineTo(x(index), y(value));
    });
    ctx.strokeStyle = dataset.borderColor;
    ctx.lineWidth = dataset.borderWidth || 2.5;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.stroke();

    values.forEach((value, index) => {
      ctx.beginPath();
      ctx.arc(x(index), y(value), 3.5, 0, Math.PI * 2);
      ctx.fillStyle = dataset.pointBackgroundColor;
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#fff';
      ctx.stroke();
    });
  }
}

window.Chart = LocalLineChart;
