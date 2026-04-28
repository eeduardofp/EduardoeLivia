/**
 * Scroll-Bound Animation Engine for Mobile
 * Sincroniza animações com o progresso do scroll do usuário
 */

class ScrollBoundAnimations {
  constructor() {
    this.elements = new Map();
    this.scrollProgress = 0;
    this.isMobile = window.innerWidth <= 768;
    this.animationFrameId = null;
    
    this.init();
  }

  init() {
    // Registra elementos que devem ser animados
    this.registerCardAnimations();
    this.registerRevealAnimations();
    
    // Listeners
    window.addEventListener('scroll', () => this.onScroll(), { passive: true });
    window.addEventListener('resize', () => this.onResize(), { passive: true });
    
    // Primeira execução
    this.onScroll();
  }

  /**
   * Registra animações dos cards da história
   */
  registerCardAnimations() {
    const historySection = document.getElementById('scene-hist');
    if (!historySection) return;

    const cards = [
      { el: document.getElementById('hc-a'), startX: 8, startY: 12, endX: 50, endY: 35 },
      { el: document.getElementById('hc-b'), startX: 90, startY: 8, endX: 45, endY: 40 },
      { el: document.getElementById('hc-c'), startX: 15, startY: 85, endX: 20, endY: 50 },
      { el: document.getElementById('hc-d'), startX: 92, startY: 90, endX: 75, endY: 55 },
      { el: document.getElementById('hc-e'), startX: 5, startY: 45, endX: 50, endY: 50 }
    ];

    cards.forEach((card, index) => {
      if (card.el) {
        this.elements.set(`card-${index}`, {
          element: card.el,
          type: 'card',
          section: historySection,
          startX: card.startX,
          startY: card.startY,
          endX: card.endX,
          endY: card.endY,
          startScale: 0.8,
          endScale: 1,
          startOpacity: 0.6,
          endOpacity: 1
        });
      }
    });
  }

  /**
   * Registra animações de reveal (fade in)
   */
  registerRevealAnimations() {
    const revealElements = document.querySelectorAll('.rv');
    revealElements.forEach((el, index) => {
      this.elements.set(`reveal-${index}`, {
        element: el,
        type: 'reveal',
        triggerOffset: 0.2 // Começa 20% antes de entrar na viewport
      });
    });
  }

  /**
   * Calcula o progresso do scroll de uma seção específica
   */
  getSectionScrollProgress(section) {
    if (!section) return 0;

    const rect = section.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    
    // Calcula quando a seção começa a aparecer e quando sai
    const startTrigger = windowHeight;
    const endTrigger = -section.offsetHeight;
    
    // Progresso de 0 a 1
    const progress = 1 - (rect.top - startTrigger) / (startTrigger - endTrigger);
    return Math.max(0, Math.min(1, progress));
  }

  /**
   * Anima cards com base no progresso do scroll
   */
  animateCard(cardData, progress) {
    if (progress < 0 || progress > 1) return;

    const { element, startX, startY, endX, endY, startScale, endScale, startOpacity, endOpacity } = cardData;
    
    // Interpolação linear
    const x = startX + (endX - startX) * progress;
    const y = startY + (endY - startY) * progress;
    const scale = startScale + (endScale - startScale) * progress;
    const opacity = startOpacity + (endOpacity - startOpacity) * progress;

    element.style.left = `${x}%`;
    element.style.top = `${y}%`;
    element.style.transform = `translate(-50%, -50%) scale(${scale})`;
    element.style.opacity = opacity;
  }

  /**
   * Anima elementos de reveal
   */
  animateReveal(revealData) {
    const { element, triggerOffset } = revealData;
    const rect = element.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    
    // Verifica se o elemento está visível
    if (rect.top < windowHeight * (1 - triggerOffset)) {
      element.classList.add('in');
    } else {
      element.classList.remove('in');
    }
  }

  /**
   * Handler do scroll
   */
  onScroll() {
    // Anima cards da história
    const historySection = document.getElementById('scene-hist');
    if (historySection) {
      const progress = this.getSectionScrollProgress(historySection);
      
      this.elements.forEach((data, key) => {
        if (key.startsWith('card-')) {
          this.animateCard(data, progress);
        }
      });

      // Mostra/esconde o histInfo baseado no progresso
      const histInfo = document.getElementById('histInfo');
      if (histInfo) {
        histInfo.style.opacity = Math.max(0, Math.min(1, (progress - 0.5) * 2));
      }
    }

    // Anima reveals
    this.elements.forEach((data, key) => {
      if (key.startsWith('reveal-')) {
        this.animateReveal(data);
      }
    });

    // Atualiza barra de progresso
    this.updateProgressBar();
  }

  /**
   * Atualiza a barra de progresso do topo
   */
  updateProgressBar() {
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrolled = (window.scrollY / scrollHeight) * 100;
    const prog = document.getElementById('prog');
    if (prog) {
      prog.style.width = `${scrolled}%`;
    }
  }

  /**
   * Handler do resize
   */
  onResize() {
    const wasMobile = this.isMobile;
    this.isMobile = window.innerWidth <= 768;
    
    if (wasMobile !== this.isMobile) {
      // Reinicializa se mudou entre mobile/desktop
      this.elements.clear();
      this.init();
    }
  }
}

// Inicializa quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  new ScrollBoundAnimations();
});
