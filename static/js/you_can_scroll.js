import gsap from 'https://cdn.skypack.dev/gsap@3.12.0';
import ScrollTrigger from 'https://cdn.skypack.dev/gsap@3.12.0/ScrollTrigger';
import { Pane } from 'https://cdn.skypack.dev/tweakpane@4.0.4';

const config = {
  theme: 'dark',
  animate: true,
  start: gsap.utils.random(0, 100, 1),
  end: gsap.utils.random(900, 1000, 1),
};

const ctrl = new Pane({ title: 'Config', expanded: false });

const update = () => {
  document.documentElement.dataset.theme = config.theme;
  document.documentElement.style.setProperty('--start', config.start);
  document.documentElement.style.setProperty('--end', config.end);
};

ctrl.addBinding(config, 'animate', { label: 'Animate' });
ctrl.addBinding(config, 'start', { label: 'Hue Start', min: 0, max: 1000, step: 1 });
ctrl.addBinding(config, 'end', { label: 'Hue End', min: 0, max: 1000, step: 1 });
ctrl.addBinding(config, 'theme', {
  label: 'Theme',
  options: { System: 'system', Light: 'light', Dark: 'dark' },
});

ctrl.on('change', update);

if (!CSS.supports('(animation-timeline: scroll()) and (animation-range: 0% 100%)')) {
  gsap.registerPlugin(ScrollTrigger);

  const items = gsap.utils.toArray('ul li').map((li) => {
    if (!li.querySelector('span')) {
      const span = document.createElement('span');
      span.innerHTML = li.innerHTML;
      li.innerHTML = '';
      li.appendChild(span);
    }
    return li;
  });

  gsap.set(items.map((li) => li.querySelector('span')), { opacity: (i) => (i !== 0 ? 0.2 : 1) });

  const dimmer = gsap.timeline()
    .to(items.slice(1).map((li) => li.querySelector('span')), { opacity: 1, stagger: 0.5 })
    .to(items.slice(0, items.length - 1).map((li) => li.querySelector('span')), { opacity: 0.2, stagger: 0.5 }, 0);

  ScrollTrigger.create({
    trigger: items[0],
    endTrigger: items[items.length - 1],
    start: 'center center',
    end: 'center center',
    animation: dimmer,
    scrub: 0.2,
  });

  const scroller = gsap.timeline().fromTo(
    document.documentElement,
    { '--hue': config.start },
    { '--hue': config.end, ease: 'none' }
  );

  ScrollTrigger.create({
    trigger: items[0],
    endTrigger: items[items.length - 1],
    start: 'center center',
    end: 'center center',
    animation: scroller,
    scrub: 0.2,
  });
}
