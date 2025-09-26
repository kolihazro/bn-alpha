<template>
  <div class="footer-info" :class="{ 'footer-info--collapsed': isCollapsed }">
    <button 
      class="footer-info__toggle"
      @click="toggleCollapse"
      :aria-label="isCollapsed ? '展开信息' : '收起信息'"
    >
      {{ isCollapsed ? '↑' : '↓' }}
    </button>
    <div class="footer-info__content">
      <span class="footer-info__item">微信：long84621</span>
      <span class="footer-info__item">✉️：hulong409@gmail.com</span>
      <!-- <span class="footer-info__item">© 2023 版权所有</span> -->
    </div>
  </div>
</template>

<script>
export default {
  name: 'FooterInfo',
  data() {
    return {
      isCollapsed: true
    }
  },
  methods: {
    toggleCollapse() {
      this.isCollapsed = !this.isCollapsed
    }
  }
}
</script>

<style scoped>

.footer-info--collapsed {
  transform: translateY(calc(100% - 12px));
}

.footer-info__content {
  display: flex;
  gap: 24px;
}

.footer-info__item {
  opacity: 0.8;
  transition: opacity 0.3s ease;
}

.footer-info--collapsed .footer-info__item {
  opacity: 0;
}

.footer-info__toggle {
  background: none;
  border: none;
  color: #6c757d;
  cursor: pointer;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 3px;
  transition: all 0.3s ease;
}

.footer-info__toggle:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .footer-info__content {
    flex-direction: column;
    gap: 4px;
  }
  
  .footer-info {
    padding: 6px 12px;
  }
}

.footer-info {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #f8f9fa;
  border-top: 1px solid #e9ecef;
  padding: 3px 16px;
  font-size: 12px;
  color: #6c757d;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: all 0.3s ease;
  z-index: 1000;
}

.footer-info__toggle {
  align-self: flex-end;
  margin-bottom: 4px;
  background: none;
  border: none;
  color: #6c757d;
  cursor: pointer;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 3px;
  transition: all 0.3s ease;
  order: -1;
}

.footer-info__content {
  display: flex;
  width: 100%;
  justify-content: center;
}

.footer-info--collapsed {
  transform: translateY(calc(100% - 25px));
}

.footer-info--collapsed .footer-info__content {
  opacity: 0;
  height: 0;
  overflow: hidden;
}
</style>