const fs = require('fs');

const content = `<script setup>
import { onMounted, ref, onBeforeUnmount } from 'vue';
import * as echarts from 'echarts';
import * as THREE from 'three';

const threeContainerRef = ref(null);
const chartMonitorRef = ref(null);
const chartMapRef = ref(null);
const chartAiRef = ref(null);
const chartAbnormalRef = ref(null);
const chartRiskRef = ref(null);
const chartEcgRef = ref(null);

let scene, camera, renderer, globe, animationId;
let charts = [];

const initThreeGlobe = () => {
  if (!threeContainerRef.value) return;

  const width = threeContainerRef.value.clientWidth;
  const height = threeContainerRef.value.clientHeight;

  scene = new THREE.Scene();
  
  camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
  camera.position.z = 100;
  camera.position.y = 5;

  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(window.devicePixelRatio);
  threeContainerRef.value.appendChild(renderer.domElement);

  // Holographic Blue Particle Heart
  const heartCount = 3500;
  const positions = new Float32Array(heartCount * 3);
  const colors = new Float32Array(heartCount * 3);
  const color = new THREE.Color();

  for (let i = 0; i < heartCount; i++) {
    const t = Math.random() * Math.PI * 2;
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y = 13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t);
    const z = (Math.random() - 0.5) * 12;
    
    const randomize = 0.6 + Math.random() * 0.5;
    
    positions[i * 3] = x * randomize;
    positions[i * 3 + 1] = y * randomize;
    positions[i * 3 + 2] = z;

    // Cyan-blue color to match the futuristic medical theme
    color.setHSL(0.55 + Math.random() * 0.1, 1.0, 0.5 + Math.random() * 0.3);
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;
  }

  const heartGeometry = new THREE.BufferGeometry();
  heartGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  heartGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const heartMaterial = new THREE.PointsMaterial({
    size: 0.6,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending
  });

  globe = new THREE.Points(heartGeometry, heartMaterial);
  // Optional: Inner core
  const innerMaterial = new THREE.PointsMaterial({
    size: 0.4,
    color: 0xffffff,
    transparent: true,
    opacity: 0.5,
    blending: THREE.AdditiveBlending
  });
  const innerHeart = new THREE.Points(heartGeometry, innerMaterial);
  innerHeart.scale.set(0.9, 0.9, 0.9);
  globe.add(innerHeart);

  scene.add(globe);

  let time = 0;
  const animate = () => {
    animationId = requestAnimationFrame(animate);
    time += 0.03;
    
    if (globe) {
      globe.rotation.y = Math.sin(time * 0.2) * 0.2;
      // Heartbeat pulse effect
      const beat = Math.max(0, Math.sin(time * 5.5)) * Math.max(0, Math.sin(time * 5.5 + 0.5));
      const scale = 1 + beat * 0.05;
      globe.scale.set(scale, scale, scale);
    }
    renderer.render(scene, camera);
  };
  animate();
};

const initCharts = () => {
  // 1. 实时监测概览 (Donut)
  const chartMonitor = echarts.init(chartMonitorRef.value);
  chartMonitor.setOption({
    tooltip: { trigger: 'item' },
    color: ['#00e5ff', '#fdb813', '#ff4d4f'],
    series: [
      {
        type: 'pie',
        radius: ['65%', '85%'],
        avoidLabelOverlap: false,
        label: { show: false, position: 'center' },
        data: [
          { value: 2482, name: '正常' },
          { value: 1023, name: '异常' },
          { value: 110, name: '危急' }
        ]
      }
    ]
  });

  // 2. 患者分布 (Mock Scatter)
  const chartMap = echarts.init(chartMapRef.value);
  chartMap.setOption({
    grid: { left: 10, right: 10, top: 10, bottom: 10 },
    xAxis: { show: false, min: -10, max: 10 },
    yAxis: { show: false, min: -10, max: 10 },
    series: [{
      type: 'scatter',
      symbolSize: function (val) { return val[2]; },
      itemStyle: { color: '#00e5ff', shadowBlur: 10, shadowColor: '#00e5ff' },
      data: [
        [-5, 5, 20], [3, 4, 15], [0, -2, 25], [-2, -6, 18], [6, -4, 12],
        [-8, 1, 10], [5, 8, 22], [-4, -3, 30]
      ]
    }]
  });

  // 3. AI分析结果 (Donut)
  const chartAi = echarts.init(chartAiRef.value);
  chartAi.setOption({
    tooltip: { trigger: 'item' },
    color: ['#00e5ff', '#fdb813', '#ff4d4f'],
    series: [
      {
        type: 'pie',
        radius: ['65%', '85%'],
        avoidLabelOverlap: false,
        label: { show: false, position: 'center' },
        data: [
          { value: 5652, name: '正常' },
          { value: 2128, name: '异常' },
          { value: 477, name: '危急' }
        ]
      }
    ]
  });

  // 4. 异常类型分布 (Horizontal Bar)
  const chartAbnormal = echarts.init(chartAbnormalRef.value);
  chartAbnormal.setOption({
    grid: { left: '0%', right: '15%', top: '5%', bottom: '5%', containLabel: true },
    xAxis: { type: 'value', show: false },
    yAxis: { 
      type: 'category', 
      data: ['其他', '室性心动过速', '室上性心动过速', 'ST段改变', '心房颤动(AF)', '室性早搏(PVC)'],
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#b0c4de', fontSize: 11 }
    },
    series: [
      {
        type: 'bar',
        barWidth: 8,
        itemStyle: {
          borderRadius: 4,
          color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: 'rgba(0, 229, 255, 0.1)' },
            { offset: 1, color: '#00e5ff' }
          ])
        },
        label: { show: true, position: 'right', color: '#fff', fontSize: 11 },
        data: [172, 312, 421, 512, 687, 1024]
      }
    ]
  });

  // 5. 风险评估 (Gauge)
  const chartRisk = echarts.init(chartRiskRef.value);
  chartRisk.setOption({
    series: [
      {
        type: 'gauge',
        startAngle: 180,
        endAngle: 0,
        min: 0, max: 100,
        splitNumber: 4,
        axisLine: {
          lineStyle: {
            width: 15,
            color: [ [0.3, '#00e5ff'], [0.7, '#fdb813'], [1, '#ff4d4f'] ]
          }
        },
        pointer: { icon: 'path://M12.8,0.7l12,40.1H0.7L12.8,0.7z', length: '60%', width: 10, offsetCenter: [0, '-20%'] },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: { color: '#b0c4de', distance: -30, fontSize: 10 },
        detail: { fontSize: 24, offsetCenter: [0, '20%'], valueAnimation: true, color: '#fff' },
        data: [{ value: 42, name: '中等风险' }],
        title: { offsetCenter: [0, '55%'], color: '#b0c4de', fontSize: 12 }
      }
    ]
  });

  // 6. 实时心电波形 (ECG Wave)
  const chartEcg = echarts.init(chartEcgRef.value);
  const ecgData = [];
  for (let i = 0; i < 500; i++) {
      let y = Math.random() * 0.1;
      const mod = i % 100;
      if (mod > 20 && mod < 30) y += 0.2 * Math.sin((mod - 20) * Math.PI / 10);
      else if (mod > 40 && mod < 42) y -= 0.2;
      else if (mod >= 42 && mod < 46) y += 1.2;
      else if (mod >= 46 && mod < 48) y -= 0.4;
      else if (mod > 60 && mod < 80) y += 0.3 * Math.sin((mod - 60) * Math.PI / 20);
      ecgData.push(y);
  }
  chartEcg.setOption({
    grid: { left: '3%', right: '2%', top: '10%', bottom: '15%', containLabel: true },
    xAxis: { 
        type: 'category', 
        data: Array.from({length: 500}, (_, i) => i),
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { show: false },
        splitLine: { show: true, lineStyle: { color: 'rgba(0, 229, 255, 0.1)' } }
    },
    yAxis: { 
        type: 'value', min: -1.5, max: 1.5,
        axisLine: { show: false },
        axisLabel: { color: '#6882a8', fontSize: 10 },
        splitLine: { show: true, lineStyle: { color: 'rgba(0, 229, 255, 0.1)' } }
    },
    series: [
      {
        type: 'line',
        data: ecgData,
        smooth: true,
        symbol: 'none',
        lineStyle: { color: '#00ffaa', width: 2 }
      }
    ]
  });

  charts = [chartMonitor, chartMap, chartAi, chartAbnormal, chartRisk, chartEcg];
};

const resizeHandler = () => {
  charts.forEach(chart => chart.resize());
  if (camera && renderer && threeContainerRef.value) {
    const width = threeContainerRef.value.clientWidth;
    const height = threeContainerRef.value.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }
};

onMounted(() => {
  initThreeGlobe();
  initCharts();
  window.addEventListener('resize', resizeHandler);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeHandler);
  cancelAnimationFrame(animationId);
  if (renderer) renderer.dispose();
  charts.forEach(chart => chart.dispose());
});
</script>

<template>
  <div class="dashboard-wrap">
    <!-- Top Stats Row -->
    <div class="top-row">
       <div class="stat-card">
           <div class="icon-wrap bg-blue"><i class="el-icon-monitor"></i></div>
           <div class="stat-info">
               <div class="name">监测设备总数</div>
               <div class="val">1,286 <span class="unit">台</span></div>
               <div class="sub">在线率 <span class="green">92.4%</span></div>
           </div>
       </div>
       <div class="stat-card">
           <div class="icon-wrap bg-cyan"><i class="el-icon-user"></i></div>
           <div class="stat-info">
               <div class="name">实时监测人数</div>
               <div class="val">3,615 <span class="unit">人</span></div>
               <div class="sub">今日新增 236</div>
           </div>
       </div>
       <div class="stat-card">
           <div class="icon-wrap bg-green"><i class="el-icon-document"></i></div>
           <div class="stat-info">
               <div class="name">今日分析心电图</div>
               <div class="val">8,257 <span class="unit">份</span></div>
               <div class="sub">AI分析完成率 <span class="green">96.7%</span></div>
           </div>
       </div>
       <div class="stat-card">
           <div class="icon-wrap bg-orange"><i class="el-icon-warning"></i></div>
           <div class="stat-info">
               <div class="name">异常预警次数</div>
               <div class="val text-orange">312 <span class="unit">次</span></div>
               <div class="sub">今日较昨日 <span class="red">↑ 18.7%</span></div>
           </div>
       </div>
       <div class="stat-card">
           <div class="icon-wrap bg-red"><i class="el-icon-bell"></i></div>
           <div class="stat-info">
               <div class="name">危急预警次数</div>
               <div class="val text-red">27 <span class="unit">次</span></div>
               <div class="sub">今日较昨日 <span class="red">↑ 28.6%</span></div>
           </div>
       </div>
    </div>

    <div class="main-grid">
      <!-- Left Column -->
      <div class="col left-col">
         <div class="panel">
            <div class="panel-header">
                <span class="title">实时监测概览</span>
                <span class="more">更多 ></span>
            </div>
            <div class="panel-body flex-row">
                <div class="chart-wrapper">
                    <div class="chart-inner" ref="chartMonitorRef"></div>
                    <div class="chart-center-text">
                        <div class="number">3,615</div>
                        <div class="desc">实时监测人数<br/>(人)</div>
                    </div>
                </div>
                <div class="legend-list">
                    <div class="legend-item"><span class="dot c-cyan"></span><span class="label">正常</span><span class="val">2,482</span><span class="per">68.6%</span></div>
                    <div class="legend-item"><span class="dot c-yellow"></span><span class="label">异常</span><span class="val">1,023</span><span class="per">28.3%</span></div>
                    <div class="legend-item"><span class="dot c-red"></span><span class="label">危急</span><span class="val">110</span><span class="per">3.1%</span></div>
                </div>
            </div>
         </div>
         
         <div class="panel">
            <div class="panel-header">
                <span class="title">最新预警列表</span>
                <span class="more">更多 ></span>
            </div>
            <div class="panel-body list-body">
                <div class="list-header">
                    <span>时间</span><span>患者</span><span>预警类型</span><span>严重程度</span>
                </div>
                <ul class="scroll-list">
                    <li><span class="c-yellow">•</span><span>14:30:21</span><span>张*国</span><span>室性早搏</span><span class="tag tag-yellow">异常</span></li>
                    <li><span class="c-yellow">•</span><span>14:29:48</span><span>李*芳</span><span>心房颤动</span><span class="tag tag-yellow">异常</span></li>
                    <li><span class="c-red">•</span><span>14:29:16</span><span>王*生</span><span>室速</span><span class="tag tag-red">危急</span></li>
                    <li><span class="c-red">•</span><span>14:28:53</span><span>赵*强</span><span>ST段抬高</span><span class="tag tag-red">危急</span></li>
                    <li><span class="c-yellow">•</span><span>14:28:31</span><span>刘*英</span><span>房性早搏</span><span class="tag tag-yellow">异常</span></li>
                </ul>
            </div>
         </div>

         <div class="panel">
            <div class="panel-header">
                <span class="title">患者分布</span>
                <span class="more">更多 ></span>
            </div>
            <div class="panel-body">
                <div class="chart-full" ref="chartMapRef"></div>
            </div>
         </div>
      </div>

      <!-- Center Column -->
      <div class="col center-col">
         <div class="center-top">
            <!-- Patient Info Left -->
            <div class="patient-card">
               <div class="title-bar">当前监测患者 <span class="status-dot"></span>在线</div>
               <div class="p-header">
                   <div class="p-avatar"><img src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png"/></div>
                   <div class="p-title">
                       <span class="name">张*国</span> <span class="sub">男 62岁</span>
                       <div class="id">患者ID: P1234567890</div>
                       <div class="dur">监测时长: 2天14小时38分</div>
                   </div>
               </div>
               <div class="p-desc-title">基础信息</div>
               <div class="p-desc">
                   <div class="row"><span>身高</span><span>175 cm</span></div>
                   <div class="row"><span>体重</span><span>72 kg</span></div>
                   <div class="row"><span>血型</span><span>O型</span></div>
                   <div class="row"><span>既往病史</span><span>高血压, 冠心病</span></div>
                   <div class="row"><span>用药情况</span><span>阿司匹林, 他汀类药物</span></div>
               </div>
            </div>

            <!-- 3D Heart -->
            <div class="heart-container">
               <div class="three-canvas" ref="threeContainerRef"></div>
               <div class="heart-base"></div>
            </div>

            <!-- Vitals Info Right -->
            <div class="vitals-card">
               <div class="vital-item">
                   <div class="v-title">实时心率</div>
                   <div class="v-content"><i class="el-icon-timer c-red"></i> <span class="num">78</span> <span class="unit">bpm</span></div>
                   <div class="v-chart wave-mini"></div>
                   <div class="v-sub">60 - 100 bpm</div>
               </div>
               <div class="vital-item">
                   <div class="v-title">当前心律</div>
                   <div class="v-content big-text c-cyan">窦性心律 <span class="tag-hollow">正常</span></div>
               </div>
               <div class="vital-item">
                   <div class="v-title">血氧饱和度</div>
                   <div class="v-content"><i class="el-icon-help c-cyan"></i> <span class="num">98</span> <span class="unit">%</span></div>
                   <div class="v-sub-chart">
                       <div class="bar-out"><div class="bar-in" style="width:98%;"></div></div>
                       <div class="bar-ticks"><span>90</span><span>95</span><span>100</span></div>
                   </div>
               </div>
            </div>
         </div>

         <!-- Bottom ECG -->
         <div class="panel ecg-panel-wrap">
            <div class="panel-header">
                <span class="title">实时心电波形</span>
                <div class="actions">
                    <span>导联切换 <select><option>II 导联</option></select></span>
                    <span>走速 <select><option>25 mm/s</option></select></span>
                    <span>增益 <select><option>10 mm/mV</option></select></span>
                </div>
            </div>
            <div class="panel-body">
                <div class="chart-full" ref="chartEcgRef"></div>
            </div>
         </div>
      </div>

      <!-- Right Column -->
      <div class="col right-col">
         <div class="panel">
            <div class="panel-header">
                <span class="title">AI分析结果</span>
                <span class="more">更多 ></span>
            </div>
            <div class="panel-body flex-row">
                <div class="chart-wrapper">
                    <div class="chart-inner" ref="chartAiRef"></div>
                    <div class="chart-center-text">
                        <div class="number text-yellow">8,257</div>
                        <div class="desc">今日分析总数<br/>(份)</div>
                    </div>
                </div>
                <div class="legend-list">
                    <div class="legend-item"><span class="dot c-cyan"></span><span class="label">正常</span><span class="val">5,652</span><span class="per">68.4%</span></div>
                    <div class="legend-item"><span class="dot c-yellow"></span><span class="label">异常</span><span class="val">2,128</span><span class="per">25.8%</span></div>
                    <div class="legend-item"><span class="dot c-red"></span><span class="label">危急</span><span class="val">477</span><span class="per">5.8%</span></div>
                </div>
            </div>
         </div>

         <div class="panel">
            <div class="panel-header">
                <span class="title">异常类型分布</span>
                <span class="more">更多 ></span>
            </div>
            <div class="panel-body">
                <div class="chart-full" ref="chartAbnormalRef"></div>
            </div>
         </div>

         <div class="panel">
            <div class="panel-header">
                <span class="title">风险评估</span>
            </div>
            <div class="panel-body flex-row pt-0">
                <div class="chart-half" ref="chartRiskRef"></div>
                <div class="info-half">
                    <div class="info-title">评估依据</div>
                    <ul class="info-ul">
                        <li>• 心率变异性：轻度降低</li>
                        <li>• ST段改变：无</li>
                        <li>• 心律失常：偶发室早</li>
                        <li>• 综合风险：中等</li>
                    </ul>
                </div>
            </div>
         </div>

         <div class="panel">
            <div class="panel-header">
                <span class="title">设备状态</span>
                <span class="more">更多 ></span>
            </div>
            <div class="panel-body device-status-body">
                <div class="device-col">
                    <div class="d-icon"><i class="el-icon-odometer"></i></div>
                    <div class="d-name">心电监护仪</div>
                    <div class="d-total">1,156</div>
                    <div class="d-detail"><span>在线 <b class="c-cyan">1,065</b></span><span>离线 <b class="c-gray">91</b></span></div>
                </div>
                <div class="device-col">
                    <div class="d-icon"><i class="el-icon-mobile"></i></div>
                    <div class="d-name">动态心电仪</div>
                    <div class="d-total">98</div>
                    <div class="d-detail"><span>在线 <b class="c-cyan">93</b></span><span>离线 <b class="c-gray">5</b></span></div>
                </div>
                <div class="device-col">
                    <div class="d-icon"><i class="el-icon-watch"></i></div>
                    <div class="d-name">血压计</div>
                    <div class="d-total">32</div>
                    <div class="d-detail"><span>在线 <b class="c-cyan">30</b></span><span>离线 <b class="c-gray">2</b></span></div>
                </div>
            </div>
         </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard-wrap {
  width: 100%;
  height: 100%;
  min-height: calc(100vh - 60px);
  background: #020914;
  color: #fff;
  display: flex;
  flex-direction: column;
  padding: 10px;
  box-sizing: border-box;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}

/* Colors */
.c-cyan { color: #00e5ff !important; }
.c-yellow { color: #fdb813 !important; }
.c-red { color: #ff4d4f !important; }
.c-gray { color: #6882a8 !important; }
.text-orange { color: #ff8c00; font-weight: bold; }
.text-red { color: #ff4d4f; font-weight: bold; }
.text-yellow { color: #fdb813; font-weight: bold; }
.green { color: #06d6a0; }
.red { color: #ef476f; }

/* Top Row */
.top-row {
  display: flex;
  gap: 15px;
  height: 80px;
  margin-bottom: 10px;
}
.stat-card {
  flex: 1;
  background: rgba(12, 26, 50, 0.6);
  border: 1px solid rgba(0, 229, 255, 0.15);
  border-radius: 8px;
  display: flex;
  align-items: center;
  padding: 0 15px;
}
.icon-wrap {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 24px;
  margin-right: 15px;
}
.bg-blue { background: rgba(0, 115, 255, 0.15); color: #0073ff; }
.bg-cyan { background: rgba(0, 229, 255, 0.15); color: #00e5ff; }
.bg-green { background: rgba(6, 214, 160, 0.15); color: #06d6a0; }
.bg-orange { background: rgba(255, 140, 0, 0.15); color: #ff8c00; }
.bg-red { background: rgba(255, 77, 79, 0.15); color: #ff4d4f; }

.stat-info { flex: 1; text-align: left; }
.stat-info .name { font-size: 13px; color: #a0aabf; }
.stat-info .val { font-size: 22px; font-weight: bold; margin: 2px 0; }
.stat-info .unit { font-size: 12px; font-weight: normal; color: #6882a8; }
.stat-info .sub { font-size: 11px; color: #6882a8; }

/* Main Grid */
.main-grid {
  display: flex;
  gap: 15px;
  flex: 1;
  min-height: 0;
}
.col { display: flex; flex-direction: column; gap: 15px; }
.left-col { flex: 3; }
.center-col { flex: 5; }
.right-col { flex: 3; }

/* Panel Common */
.panel {
  background: rgba(12, 26, 50, 0.6);
  border: 1px solid rgba(0, 229, 255, 0.15);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  flex: 1;
  position: relative;
}
.panel::before {
  content: ""; position: absolute; top: -1px; left: -1px; width: 10px; height: 10px;
  border-top: 2px solid #00e5ff; border-left: 2px solid #00e5ff;
}
.panel::after {
  content: ""; position: absolute; bottom: -1px; right: -1px; width: 10px; height: 10px;
  border-bottom: 2px solid #00e5ff; border-right: 2px solid #00e5ff;
}
.panel-header {
  height: 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 15px;
  border-bottom: 1px solid rgba(0, 229, 255, 0.1);
}
.panel-header .title {
  font-size: 15px; font-weight: bold; color: #00e5ff;
  border-left: 3px solid #00e5ff; padding-left: 8px;
}
.panel-header .more { font-size: 12px; color: #6882a8; cursor: pointer; }
.panel-body { flex: 1; padding: 15px; display: flex; flex-direction: column; position: relative; min-height:0; }
.flex-row { flex-direction: row; align-items: center; }

/* Charts */
.chart-wrapper { position: relative; flex: 1; height: 100%; display: flex; justify-content: center; align-items: center; }
.chart-inner { width: 100%; height: 100%; }
.chart-full { width: 100%; height: 100%; min-height: 120px; }
.chart-half { flex: 1; height: 100%; }
.chart-center-text {
  position: absolute; text-align: center; pointer-events: none;
}
.chart-center-text .number { font-size: 20px; font-weight: bold; color: #fff; }
.chart-center-text .desc { font-size: 10px; color: #6882a8; margin-top: 4px; transform: scale(0.9); }

.legend-list { flex: 1; display: flex; flex-direction: column; gap: 10px; }
.legend-item { display: flex; align-items: center; font-size: 12px; }
.legend-item .dot { width: 6px; height: 6px; border-radius: 50%; margin-right: 8px; }
.legend-item .label { color: #a0aabf; width: 40px; }
.legend-item .val { color: #fff; font-weight: bold; width: 45px; text-align: right; margin-right: 15px; }
.legend-item .per { color: #6882a8; text-align: right; }

/* List Body */
.list-body { padding: 10px; }
.list-header { display: flex; font-size: 12px; color: #6882a8; padding: 0 5px 8px; border-bottom: 1px solid rgba(255,255,255,0.05); margin-bottom: 5px; }
.list-header span { flex: 1; text-align: left; }
.list-header span:first-child { flex: 1.2; }
.list-header span:last-child { flex: 0.8; text-align: right; }
.scroll-list { list-style: none; margin: 0; padding: 0; overflow-y: auto; flex: 1; }
.scroll-list li { display: flex; font-size: 12px; padding: 8px 5px; align-items: center; }
.scroll-list li:nth-child(even) { background: rgba(255,255,255,0.02); }
.scroll-list li span { flex: 1; color: #d0d8e8; }
.scroll-list li span:first-child { flex: 1.2; }
.scroll-list li span:last-child { flex: 0.8; text-align: right; }
.tag { padding: 2px 6px; border-radius: 2px; font-size: 11px; }
.tag-yellow { background: rgba(253,184,19,0.15); color: #fdb813; border: 1px solid rgba(253,184,19,0.3); }
.tag-red { background: rgba(255,77,79,0.15); color: #ff4d4f; border: 1px solid rgba(255,77,79,0.3); }

/* Center Middle */
.center-top { display: flex; gap: 15px; flex: 2; position: relative; }
.patient-card { width: 220px; background: rgba(12, 26, 50, 0.4); padding: 15px; border-radius: 8px; border: 1px solid rgba(0, 229, 255, 0.1); }
.vitals-card { width: 200px; padding: 15px; display: flex; flex-direction: column; gap: 10px; }
.heart-container { flex: 1; position: relative; display: flex; justify-content: center; align-items: center; }
.three-canvas { width: 100%; height: 100%; position: absolute; z-index: 10;}
.heart-base {
  position: absolute; bottom: 20%; width: 200px; height: 60px;
  background: radial-gradient(ellipse at center, rgba(0, 229, 255, 0.4) 0%, transparent 70%);
  transform: rotateX(75deg); z-index: 5; border-radius: 50%;
  box-shadow: 0 0 30px rgba(0, 229, 255, 0.2);
}

/* Patient Area */
.title-bar { font-size: 12px; color: #a0aabf; margin-bottom: 15px; }
.status-dot { display: inline-block; width: 6px; height: 6px; background: #06d6a0; border-radius: 50%; margin: 0 6px; }
.p-header { display: flex; gap: 10px; margin-bottom: 20px; }
.p-avatar img { width: 44px; height: 44px; border-radius: 50%; border: 1px solid rgba(0,229,255,0.4); }
.p-title { display: flex; flex-direction: column; gap: 3px; }
.p-title .name { font-size: 16px; font-weight: bold; color: #fff; }
.p-title .sub { font-size: 11px; color: #a0aabf; }
.p-title .id { font-size: 11px; color: #6882a8; margin-top: 5px; }
.p-title .dur { font-size: 10px; color: #00e5ff; }
.p-desc-title { font-size: 12px; color: #00e5ff; border-left: 2px solid #00e5ff; padding-left: 6px; margin-bottom: 10px; }
.p-desc .row { display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 8px; border-bottom: 1px dashed rgba(255,255,255,0.05); padding-bottom: 4px; }
.p-desc .row span:first-child { color: #6882a8; }
.p-desc .row span:last-child { color: #d0d8e8; }

/* Vitals Area */
.vital-item { background: rgba(0, 229, 255, 0.03); border: 1px solid rgba(0, 229, 255, 0.1); border-radius: 6px; padding: 10px 15px; }
.vital-item .v-title { font-size: 12px; color: #a0aabf; margin-bottom: 5px; }
.vital-item .v-content { font-size: 24px; font-weight: bold; display: flex; align-items: baseline; gap: 5px; }
.vital-item .v-content i { font-size: 18px; }
.vital-item .unit { font-size: 12px; font-weight: normal; color: #6882a8; margin-left: 2px; }
.vital-item .v-sub { font-size: 10px; color: #6882a8; margin-top: 5px; text-align: right; }
.big-text { font-size: 18px !important; }
.tag-hollow { font-size: 10px; border: 1px solid #06d6a0; color: #06d6a0; padding: 0 4px; border-radius: 2px; line-height: 16px; margin-left: auto; }
.wave-mini { height: 20px; width: 100%; border-bottom: 1px solid rgba(255,77,79,0.3); position: relative; margin-top: 5px; }
.bar-out { width: 100%; height: 4px; background: rgba(255,255,255,0.1); border-radius: 2px; margin-top: 10px; }
.bar-in { height: 100%; background: #00e5ff; border-radius: 2px; box-shadow: 0 0 5px #00e5ff; }
.bar-ticks { display: flex; justify-content: space-between; font-size: 9px; color: #6882a8; margin-top: 4px; }

/* Center Bottom ECG */
.ecg-panel-wrap { flex: 1.2; min-height: 150px; }
.actions { font-size: 11px; color: #a0aabf; display: flex; gap: 15px; }
.actions select { background: #0c1a32; border: 1px solid rgba(0,229,255,0.3); color: #00e5ff; font-size: 11px; border-radius: 2px; outline: none; padding: 2px 4px;}

/* Right Panel Extras */
.info-half { flex: 1; padding-left: 10px; display: flex; flex-direction: column; justify-content: center; }
.info-title { font-size: 12px; color: #a0aabf; margin-bottom: 10px; }
.info-ul { list-style: none; padding: 0; margin: 0; font-size: 11px; color: #d0d8e8; }
.info-ul li { margin-bottom: 8px; line-height: 1.4; }
.pt-0 { padding-top: 0; }

.device-status-body { display: flex; flex-direction: row; gap: 10px; align-items: center; justify-content: space-between;}
.device-col { flex: 1; background: rgba(255,255,255,0.02); text-align: center; border-radius: 6px; padding: 10px 5px; border: 1px solid rgba(0,229,255,0.05); }
.device-col .d-icon { font-size: 20px; color: #00e5ff; margin-bottom: 5px; }
.device-col .d-name { font-size: 11px; color: #a0aabf; margin-bottom: 5px;}
.device-col .d-total { font-size: 18px; font-weight: bold; color: #fff; margin-bottom: 5px; }
.device-col .d-detail { font-size: 10px; display: flex; justify-content: space-around; color: #6882a8; }
.device-col .d-detail b { font-weight: normal; margin-left: 2px; }
</style>
`

fs.writeFileSync('src/views/dashboard/dashboard.vue', content);
