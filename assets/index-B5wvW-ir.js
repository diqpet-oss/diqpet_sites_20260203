// --- begin: remove-price-lines (自动注入，若需回退请删除此段) ---
(function () {
  function removePriceNodes(root) {
    try {
      var walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT, null, false);
      var nodesToRemove = [];
      var el;
      while ((el = walker.nextNode())) {
        // 跳过 SCRIPT 和 STYLE
        var tag = el.tagName && el.tagName.toLowerCase();
        if (tag === 'script' || tag === 'style' || tag === 'noscript') continue;
        // 只处理没有子元素或文本量较多的元素，避免误删包含价格但并非独立显示的元素
        var text = el.textContent && el.textContent.trim();
        if (!text) continue;
        if (text.indexOf('₩') !== -1 || /[0-9,.,\s]+원/.test(text)) {
          // 标记外层最近的产品卡容器（常见类名）以便删除整行而非单个字符节点
          var container = el;
          // 向上找，限制到最多3层，以避免删除整个页面
          for (var i = 0; i < 3 && container.parentElement; i++) {
            if (container.className && /product|card|item|price/i.test(container.className)) break;
            container = container.parentElement;
          }
          nodesToRemove.push(container);
        }
      }
      // 去重并移除/隐藏
      var seen = new Set();
      nodesToRemove.forEach(function (n) {
        if (!n || !n.parentNode) return;
        if (seen.has(n)) return;
        seen.add(n);
        // 选择移除或隐藏：这里使用移除
        n.parentNode.removeChild(n);
      });
    } catch (e) {
      // 安静失��，不影响页面运行
      console && console.error && console.error('remove-price-lines failed', e);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      removePriceNodes(document.body);
      // 监听页面后续异步渲染，尝试执行一次
      setTimeout(function () { removePriceNodes(document.body); }, 600);
    });
  } else {
    removePriceNodes(document.body);
    setTimeout(function () { removePriceNodes(document.body); }, 600);
  }

  // 若站点使用前端路由或动态加载商品卡，可额外使用 MutationObserver
  try {
    var mo = new MutationObserver(function (mutations) {
      mutations.forEach(function (m) {
        if (m.addedNodes && m.addedNodes.length) {
          for (var i = 0; i < m.addedNodes.length; i++) {
            var n = m.addedNodes[i];
            if (n.nodeType === 1) removePriceNodes(n);
          }
        }
      });
    });
    mo.observe(document.body, { childList: true, subtree: true });
  } catch (e) {}
})();
// --- end: remove-price-lines ---
