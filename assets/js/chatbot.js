(function (root) {
  'use strict';

  /* ───────────────────────── Helpers ───────────────────────── */

  const normalize = text =>
    String(text).toLowerCase().normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd').replace(/Đ/g, 'd')
      .replace(/[^a-z0-9]+/g, ' ').trim();

  const money = n => Math.round(n).toLocaleString('vi-VN') + ' đồng';

  /* ─────────────── Knowledge Base (dữ liệu tĩnh) ─────────── */

  const travelTips = {
    hagiang: {
      bestTime: 'Tháng 10–12 (mùa hoa tam giác mạch, lúa chín), tháng 3–5 (ruộng bậc thang xanh mướt)',
      tips: [
        'Đường đèo quanh co và dốc – nên thuê xe ôm bản địa hoặc lái xe có kinh nghiệm',
        'Mang áo ấm dù đi mùa hè (nhiệt độ ban đêm xuống thấp trên cao nguyên)',
        'Xin giấy phép biên giới nếu đi các xã giáp biên',
        'Nên dành ít nhất 3–4 ngày cho vòng cung Đông Bắc',
      ],
      transport: ['Xe khách từ Hà Nội (~6–8 tiếng, qua Tuyên Quang)', 'Xe máy tự lái hoặc thuê xe ôm tại chỗ'],
      audience: ['phượt thủ', 'nhóm bạn', 'nhiếp ảnh'],
    },
    danang: {
      bestTime: 'Tháng 3–8 (ít mưa, biển đẹp, nắng ấm)',
      tips: [
        'Di chuyển nội thành bằng Grab hoặc xe máy thuê rất tiện',
        'Kem bơ Đà Nẵng là đặc sản không nên bỏ lỡ',
        'Bãi biển Mỹ Khê đẹp nhất lúc bình minh và hoàng hôn',
        'Nên kết hợp đi Hội An (cách ~30 phút) và Bà Nà Hills',
      ],
      transport: ['Máy bay (~1.5h từ HN/SG)', 'Tàu hỏa Thống Nhất (~16–20h)', 'Xe khách (~12–18h)'],
      audience: ['gia đình', 'cặp đôi', 'nhóm bạn'],
    },
    hanoi: {
      bestTime: 'Tháng 9–11 (thu Hà Nội), tháng 3–4 (xuân ấm áp)',
      tips: [
        'Phố cổ đông đúc – nên đi bộ hoặc xích lô để trải nghiệm',
        'Thử phở sáng, cà phê trứng, bún chả trưa, bia hơi tối',
        'Cẩn thận khi sang đường – giao thông khá đông',
        'Hồ Hoàn Kiếm đẹp nhất vào sáng sớm và tối muộn',
      ],
      transport: ['Máy bay (~2h từ SG)', 'Tàu hỏa', 'Xe khách'],
      audience: ['gia đình', 'cặp đôi', 'solo', 'văn hóa'],
    },
    dalat: {
      bestTime: 'Tháng 11–3 (mùa khô, hoa nở rộ), tránh tháng 6–9 (mưa nhiều)',
      tips: [
        'Buổi tối se lạnh, mang áo khoác dù là mùa hè',
        'Thuê xe máy khám phá các đồi chè, hồ, thác ngoại ô',
        'Chợ Đà Lạt buổi tối là điểm ăn vặt tuyệt vời',
        'Nên thử cà phê vườn – đặc trưng chỉ Đà Lạt mới có',
      ],
      transport: ['Máy bay đến Liên Khương (~50 phút từ SG)', 'Xe khách (~7–8h từ SG)', 'Xe máy (phượt)'],
      audience: ['cặp đôi', 'gia đình', 'nhóm bạn'],
    },
    halong: {
      bestTime: 'Tháng 3–5 và tháng 9–11 (thời tiết mát, ít mưa)',
      tips: [
        'Nên chọn tour du thuyền nghỉ đêm trên vịnh để trải nghiệm trọn vẹn',
        'Tháng 7–8 có thể có bão – kiểm tra thời tiết trước khi đi',
        'Chèo kayak và tham quan hang động là trải nghiệm không nên bỏ lỡ',
        'Mang kem chống nắng và giày chống trơn',
      ],
      transport: ['Xe khách từ Hà Nội (~3–4 tiếng)', 'Tour trọn gói từ Hà Nội', 'Thủy phi cơ (~45 phút)'],
      audience: ['gia đình', 'cặp đôi', 'nhóm bạn'],
    },
    hoian: {
      bestTime: 'Tháng 2–5 (ít mưa, không quá nóng)',
      tips: [
        'Phố cổ đẹp nhất vào buổi tối khi đèn lồng được thắp sáng',
        'Kiểm tra giá vé và phạm vi tham quan với điểm bán chính thức trước khi mua',
        'Nên thử may áo dài hoặc quần áo – Hội An nổi tiếng về may đo',
        'Thuê xe đạp dạo phố cổ và làng rau Trà Quế',
      ],
      transport: ['Bay đến Đà Nẵng rồi đi xe (~30 phút)', 'Xe khách/bus từ Đà Nẵng', 'Grab/taxi'],
      audience: ['cặp đôi', 'solo', 'văn hóa', 'nhiếp ảnh'],
    },
    caobang: {
      bestTime: 'Tháng 9–11 (mùa thu, lúa chín vàng, thác Bản Giốc đẹp nhất)',
      tips: [
        'Đường đi từ Hà Nội khá xa – nên nghỉ đêm tại thị trấn Trùng Khánh',
        'Thác Bản Giốc nằm ở biên giới – mang theo giấy tờ tùy thân',
        'Thử đặc sản vịt quay Cao Bằng',
        'Kết hợp với Hà Giang nếu có 5–7 ngày',
      ],
      transport: ['Xe khách từ Hà Nội (~7–8 tiếng)', 'Xe máy tự lái'],
      audience: ['phượt thủ', 'nhóm bạn', 'thiên nhiên'],
    },
    hue: {
      bestTime: 'Tham khảo mùa đi phù hợp với hoạt động; kiểm tra dự báo gần ngày khởi hành',
      tips: [
        'Mua vé combo tham quan Đại Nội + các lăng tẩm để tiết kiệm',
        'Ẩm thực Huế cay – nên dặn nhà hàng giảm ớt nếu không ăn được cay',
        'Sông Hương đẹp nhất vào buổi chiều và tối (thả hoa đăng)',
        'Nên dành 2 ngày: 1 ngày cho Đại Nội, 1 ngày cho lăng tẩm',
      ],
      transport: ['Máy bay đến Phú Bài (~1.5h từ SG)', 'Tàu hỏa qua Huế', 'Xe khách từ Đà Nẵng (~2.5h)'],
      audience: ['gia đình', 'cặp đôi', 'văn hóa'],
    },
    lyson: {
      bestTime: 'Tháng 3–9 (biển lặng, trời đẹp)',
      tips: [
        'Đặt tàu cao tốc sớm (hay hết vé vào cuối tuần và lễ)',
        'Thuê xe máy trên đảo để khám phá (đảo nhỏ, đi trong 1–2 ngày)',
        'Tỏi Lý Sơn và gỏi cá cơm là đặc sản nên thử',
        'Nên đi cả Đảo Bé nếu thời tiết tốt',
      ],
      transport: ['Tàu cao tốc từ cảng Sa Kỳ, Quảng Ngãi (~30 phút)', 'Bay đến Chu Lai hoặc Đà Nẵng rồi đi xe đến Sa Kỳ'],
      audience: ['nhóm bạn', 'cặp đôi', 'biển đảo'],
    },
    cantho: {
      bestTime: 'Tháng 11–4 (mùa khô, thuận tiện đi chợ nổi)',
      tips: [
        'Dậy sớm ~5h sáng để đi chợ nổi Cái Răng – đông nhất 6–7h',
        'Thử hủ tiếu, bánh xèo miền Tây, lẩu mắm',
        'Thuê ghe máy riêng để thoải mái tham quan chợ nổi',
        'Kết hợp thăm vườn trái cây theo mùa',
      ],
      transport: ['Máy bay đến Cần Thơ (~1.5h từ HN)', 'Xe khách từ SG (~3–4h)', 'Xe limousine'],
      audience: ['gia đình', 'nhóm bạn', 'ẩm thực'],
    },
  };

  const safetyTips = [
    'Luôn mang theo giấy tờ tùy thân (CMND/CCCD hoặc hộ chiếu)',
    'Giữ tiền và đồ giá trị ở nơi an toàn, hạn chế mang quá nhiều tiền mặt',
    'Kiểm tra dự báo thời tiết trước khi đi, đặc biệt mùa mưa bão',
    'Lưu số điện thoại khẩn cấp: 113 (công an), 115 (cấp cứu), 114 (cứu hỏa)',
    'Uống đủ nước, bôi kem chống nắng khi hoạt động ngoài trời',
    'Cẩn thận khi tham gia giao thông – đội mũ bảo hiểm khi đi xe máy',
    'Ăn uống tại quán đông khách để đảm bảo vệ sinh an toàn thực phẩm',
    'Thông báo lịch trình cho người thân khi đi xa hoặc đi đường núi',
  ];

  const audienceLabels = {
    'gia dinh': 'gia đình',
    'cap doi': 'cặp đôi',
    'nhom ban': 'nhóm bạn',
    'solo': 'du lịch solo',
    'phuot': 'phượt thủ',
    'phuot thu': 'phượt thủ',
    'mot minh': 'du lịch solo',
    'di mot minh': 'du lịch solo',
    'nguoi lon tuoi': 'gia đình',
    'tre em': 'gia đình',
    'tre nho': 'gia đình',
  };

  /* ─────────────────── Chatbot Factory ────────────────────── */

  function create(E) {
    const entries = Object.entries(E.destinations);
    const detailedIds = Object.keys(travelTips);
    let focus = null;
    let pendingTopic = null, comparison = null, budgetQuestion = null;

    function readFocus() {
      try {
        const value = root.sessionStorage?.getItem('tripmate.chat-focus.v1');
        if (root.sessionStorage) focus = value && E.destinations[value] ? value : null;
      } catch {}
    }
    function saveFocus() {
      try { if (focus) root.sessionStorage?.setItem('tripmate.chat-focus.v1', focus); } catch {}
    }
    readFocus();

    const defaults = ['Bạn có thể làm gì?', 'Gợi ý điểm đến', 'Xem lịch trình', 'Chi phí chuyến đi'];

    /* ── Destination matching ── */

    function score(d, q) {
      return Math.max(0, ...[d.name, d.name.split(/\s[-–]\s|\s*\(/)[0]].map(name => {
        const n = normalize(name);
        return n.length > 2 && (' ' + q + ' ').includes(' ' + n + ' ') ? n.length : 0;
      }));
    }

    function matchDestinations(q) {
      const aliases = { danang:'danang', dalat:'dalat', hanoi:'hanoi', halong:'halong', hoian:'hoian', hagiang:'hagiang', cantho:'cantho' };
      for (const [term, id] of Object.entries(aliases)) {
        if ((' ' + q + ' ').includes(' ' + term + ' ') && E.destinations[id]) return [[id, E.destinations[id]]];
      }
      const matches = entries.filter(([, d]) => score(d, q) > 0).sort((a, b) => score(b[1], q) - score(a[1], q));
      if (matches.length) return matches;

      // Resolve named attractions to their parent destination
      const attraction = entries
        .flatMap(([id, d]) => d.places.map(p => ({
          id, name: p[0],
          term: normalize(p[0]).replace(/^(tham quan|kham pha|dao|ngam|thuong thuc) /, ''),
        })))
        .filter(p => p.term.length > 5 && (' ' + q + ' ').includes(' ' + p.term + ' '))
        .sort((a, b) => b.term.length - a.term.length)[0];

      if (attraction) return [entries.find(([id]) => id === attraction.id)];
      return [];
    }

    /* ── Multi-destination extractor (for comparison) ── */

    function extractMultipleDestinations(q) {
      const found = [];
      for (const [id, d] of entries) {
        const names = [d.name, d.name.split(/\s[-–]\s|\s*\(/)[0]];
        for (const name of names) {
          const n = normalize(name);
          if (n.length > 2 && (' ' + q + ' ').includes(' ' + n + ' ') && !found.some(f => f[0] === id)) {
            found.push([id, d]);
          }
        }
      }
      return found;
    }

    /* ── Helpers ── */

    function dailyCost(d) { return d.stay + d.food + d.transport; }

    function findByTag(tag, limit = 6) {
      return entries.filter(([, d]) => d.places.some(p => p[1] === tag)).slice(0, limit);
    }

    function freePlaces(d) {
      return d.places.filter(p => p[2] === 0);
    }

    function getDaySlot(plan, dayIndex, slotName) {
      if (!plan || dayIndex < 0 || dayIndex >= plan.days.length) return null;
      const slots = { sang: 0, 'buoi sang': 0, chieu: 1, 'buoi chieu': 1, toi: 2, 'buoi toi': 2 };
      const idx = slots[slotName];
      if (idx === undefined) return null;
      return plan.days[dayIndex].activities[idx];
    }

    /* ─────────────── Main respond function ─────────────────── */

    function respond(plan, text) {
      readFocus();
      text = String(text || '').trim().slice(0, 600);
      let q = normalize(text).replace(/\b(?:doi|thay doi|thay) (?:lich trinh|hoat dong|dia diem) ngay\b/g, 'doi ngay');
      if (comparison && q.split(' ').length <= 6) {
        const candidate = matchDestinations(q);
        if (candidate.length && candidate[0][0] !== comparison && !/\b(chi phi|an gi|gioi thieu|thoi tiet)\b/.test(q)) {
          text = 'So sánh ' + E.destinations[comparison].name + ' và ' + text;
          q = normalize(text);
          comparison = null;
        }
      }
      if (budgetQuestion && !/\b(huy|thoi|khong|bo qua)\b/.test(q) && /\b(\d+\s*(ngay|nguoi)|moi nguoi|ca nhom|tong)\b/.test(q)) {
        text = budgetQuestion + ' ' + text;
        q = normalize(text);
      }
      budgetQuestion = null;

      // Detect destination(s) in question
      const matches = matchDestinations(q);
      if (matches.length) { focus = matches[0][0]; saveFocus(); }

      if (pendingTopic && matches.length && q.split(' ').length <= 6) q = pendingTopic + ' ' + q;
      pendingTopic = null;

      // Context pronouns: ở đó, chỗ đó, nơi đó, ở đây, điểm này, điểm đó
      if (!matches.length && /\b(o do|cho do|noi do|o day|diem nay|diem do|tai do|tai day)\b/.test(q)) {
        // Keep current focus if available
      }

      const id = focus || plan?.input?.destination;
      const d = E.destinations[id];
      const tips = travelTips[id];

      const result = (reply, suggestions = defaults) => ({ reply, suggestions });
      const related = d
        ? ['Có gì chơi ở ' + d.name, 'Chi phí tại ' + d.name, 'Tips du lịch ' + d.name]
        : defaults;

      // Do not answer about the previous destination when a new place is unsupported.
      if (!matches.length) {
        const location = q.match(/\b(?:o|tai)\s+(.+)$/)?.[1] || q.match(/^(?:gioi thieu|ke ve|noi ve)\s+(.+)$/)?.[1];
        if (location && !/^(do|day|dau|noi do|diem nay|dia diem nay|diem den)\b/.test(location)) {
          const region = entries.find(([, dest]) => dest.region && normalize(dest.region) === location)?.[1].region;
          if (region) {
            const list = entries.filter(([, dest]) => dest.region === region).slice(0,6);
            return result('Mình có các địa điểm sau tại **' + region + '**. Bạn muốn tìm hiểu nơi nào?\n' + list.map(([, dest]) => '• ' + dest.name).join('\n'), list.slice(0,3).map(([, dest]) => 'Giới thiệu ' + dest.name));
          }
          return result('Mình chưa nhận diện được địa điểm trong câu hỏi này. Bạn thử viết rõ tên địa điểm; nếu nơi đó chưa có dữ liệu, mình chưa thể tư vấn chính xác.', ['Gợi ý điểm đến', 'Giới thiệu Hội An', 'Giới thiệu Đà Nẵng']);
        }
      }

      const topic = q.match(/\b(an gi|co gi choi|chi phi|mua dep|tips|phuong tien)\b/)?.[0];
      if (!d && topic && !/\b(chuyen di|lich trinh|hanh trinh|goi y|di dau|o dau)\b/.test(q)) {
        pendingTopic = topic;
        return result('Bạn muốn hỏi về điểm đến nào? Chọn một nơi hoặc nhập tên địa điểm nhé.', ['Đà Nẵng', 'Hội An', 'Đà Lạt']);
      }
      const dayMatch = q.match(/\bngay\s+(\d+)\b(?!\s*nguoi)/);
      if (plan && dayMatch && /\b(xem|doi|thay|sang|chieu|toi|lich trinh)\b/.test(q) && (+dayMatch[1] < 1 || +dayMatch[1] > plan.days.length)) {
        return result('Chuyến đi hiện có ' + plan.days.length + ' ngày. Bạn hãy chọn từ ngày 1 đến ngày ' + plan.days.length + '.', plan.days.slice(0, 4).map(day => 'Xem ngày ' + day.number));
      }
      if (/\b(khong|dung|cho|chua)\b.*\b(doi|thay|giam|tiet kiem)\b/.test(q)) {
        return result('Mình giữ nguyên lịch trình. Bạn muốn tìm hiểu thêm về điểm đến hay chi phí?', related);
      }
      if (/\b(doi|thay)\b/.test(q) && /\b(?:buoi (?:sang|chieu|toi)|(?:sang|chieu|toi) ngay)\b/.test(q) && dayMatch) {
        return result('Hiện mình đổi hoạt động theo cả ngày, chưa đổi riêng từng buổi. Lịch trình của bạn vẫn giữ nguyên.', ['Xem ngày ' + dayMatch[1], 'Đổi địa điểm ngày ' + dayMatch[1]]);
      }
      if (/\b(cach|meo|lam sao|tu van|kinh nghiem)\b/.test(q) && /\b(giam chi phi|tiet kiem|re hon)\b/.test(q)) {
        return result('**Bạn có thể cân đối chi phí bằng cách:**\n• Giảm số ngày hoặc chọn điểm đến gần hơn.\n• Xem lại dự toán lưu trú và ăn uống.\n• Ưu tiên hoạt động có dự toán thấp.\n\nMình chưa thay đổi lịch trình. Chọn “Giảm chi phí” nếu muốn áp dụng phương án tiết kiệm trong dữ liệu mẫu.', plan ? ['Chi phí chuyến đi', 'Giảm chi phí'] : ['Gợi ý điểm đến', 'Bạn có thể làm gì?']);
      }
      if (/\b(tao|lap|len)\b.*\b(lich trinh|ke hoach)\b/.test(q) || /\bdoi diem den\b/.test(q)) {
        return { ...result('Chọn điểm đến, số ngày, số người và ngân sách tại trang **Tạo lịch trình**. Mình sẽ dùng bản nháp đó để tư vấn và điều chỉnh.\n\n' + (d ? 'Mình đã chọn sẵn **' + d.name + '** trong đường dẫn bên dưới.' : 'Bắt đầu bằng nơi bạn muốn đến nhé.'), related), actions: [{ label: 'Tạo lịch trình' + (d ? ' · ' + d.name : ''), href: 'plan.html' + (d ? '?destination=' + encodeURIComponent(id) : '') }] };
      }
      if (/\b(hom nay|ngay mai|hien tai|moi nhat|con phong|con ve)\b/.test(q)) {
        return result('Mình chưa có dữ liệu trực tiếp về thời tiết, giá vé, phòng trống hay tình hình hiện tại' + (d ? ' tại **' + d.name + '**' : '') + '. Hãy kiểm tra với địa điểm hoặc đơn vị cung cấp gần ngày đi.\n\nMình vẫn có thể giúp bạn xem hoạt động và dự toán mẫu.', related);
      }
      // Ask for duration and group size before estimating a trip budget.
      if (/\b(di dau|o dau|diem den|dia diem|goi y|nen di|cho nao)\b/.test(q)) {
        const raw = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd');
        const amount = raw.match(/(\d+(?:[.,]\d+)?)\s*(trieu|tr|k|nghin|ngan)\b/);
        if (amount) {
          const total = Number(amount[1].replace(',', '.')) * (/^(trieu|tr)$/.test(amount[2]) ? 1000000 : 1000);
          const days = Number(q.match(/\b(\d+)\s*ngay\b/)?.[1]);
          const people = Number(q.match(/\b(\d+)\s*nguoi\b/)?.[1]);
          const perPerson = /\b(moi nguoi|mot nguoi|nguoi mot)\b/.test(q) || /\/\s*nguoi/.test(raw);
          if (!days || (!people && !perPerson)) {
            budgetQuestion = text;
            return result('Ngân sách **' + money(total) + '** dành cho chuyến đi mấy ngày và bao nhiêu người? Bạn có thể nhắn “3 ngày, 2 người, tổng cả nhóm” hoặc “3 ngày, mỗi người”.', ['3 ngày, 2 người, tổng cả nhóm', '2 ngày, mỗi người']);
          }
          if (days > 14 || (people || 1) > 20) return result('Mình hỗ trợ dự toán chuyến đi từ 1–14 ngày, tối đa 20 người. Hãy điều chỉnh thông tin nhé.');
          const limit = perPerson ? total : total / people;
          const ranked = entries.filter(([key]) => detailedIds.includes(key)).map(([key, dest]) => ({ key, dest, cost: dest.stay * Math.max(0, days - 1) + (dest.food + dest.transport) * days })).sort((a, b) => a.cost - b.cost);
          const affordable = ranked.filter(item => item.cost <= limit).slice(0, 4);
          const list = affordable.length ? affordable : ranked.slice(0, 3);
          return result('**Dự toán cơ bản cho ' + days + ' ngày' + (people ? ', ' + people + ' người' : ', mỗi người') + ':**\nNgân sách: ' + money(total) + (perPerson ? '/người' : ' cho cả nhóm') + '.\n\n' + (affordable.length ? 'Các lựa chọn trong mức dự toán này:' : 'Chưa có lựa chọn nằm trong ngân sách. Các mức thấp nhất trong dữ liệu:') + '\n' + list.map(item => '• **' + item.dest.name + '** — ' + money(item.cost * (perPerson ? 1 : people)) + (perPerson ? '/người' : '/cả nhóm')).join('\n') + '\n\nGồm ' + Math.max(0, days - 1) + ' đêm lưu trú, ăn uống và đi lại tại điểm đến. Chưa gồm vé đến, phí hoạt động và dự phòng; đây là dữ liệu mẫu.', list.map(item => 'Giới thiệu ' + item.dest.name));
        }
      }

      /* ══════════════ INTENT MATCHING (priority order) ══════════════ */

      // ─── 1. Emoji reactions (before !q check since emojis normalize to empty) ───
      if (/^(ok|okee?|okie|okay|nice|hay|tuyet|tuyet voi|qua tuyet|dep qua|tot lam|wow)$/i.test(q) || /^[\u{1F300}-\u{1FAD6}\u{2600}-\u{27BF}\u{FE00}-\u{FE0F}\u{200D}\u{20E3}\s]+$/u.test(text.trim()) || (!q && text.trim().length > 0)) {
        return result('Cảm ơn bạn! 😊 Mình sẵn sàng giúp bạn khám phá thêm. Hỏi bất cứ điều gì về du lịch nhé!', related);
      }

      if (!q) return result('Bạn muốn khám phá địa điểm nào? Nhắn tên tỉnh thành hoặc hỏi "Gợi ý điểm đến" nhé.');

      // ─── 2. Phủ định / từ chối ───
      if (/\b(khong|dung|cho|chua can)\s+(muon\s+|can\s+)?(doi|thay|giam|tiet kiem)\b/.test(q)) {
        return result('Mình giữ nguyên lịch trình nhé. Bạn có thể hỏi về điểm đến, hoạt động hoặc dự toán.', related);
      }

      // ─── 3. Chào hỏi ───
      if (/\b(xin chao|chao ban|chao|hello|hi|hey|yo)\b/.test(q) && q.split(' ').length <= 5) {
        return result(
          'Chào bạn! 👋 Mình là Tripmate, trợ lý du lịch Việt Nam với **' + entries.length + ' điểm đến** có sẵn.\n\n' +
          'Mình có thể giúp bạn:\n' +
          '• Giới thiệu và so sánh điểm đến\n' +
          '• Gợi ý hoạt động, ẩm thực, chi phí\n' +
          '• Điều chỉnh lịch trình\n' +
          '• Tips và mẹo du lịch\n\n' +
          'Bạn muốn đi đâu?',
          ['Gợi ý điểm đến', 'Điểm đến rẻ nhất', 'So sánh Đà Nẵng và Đà Lạt']
        );
      }

      // ─── 4. Cảm ơn ───
      if (/\b(cam on|thanks|thank you|thank)\b/.test(q)) {
        return result('Rất vui được đồng hành cùng bạn! ✨ Bạn muốn tìm hiểu thêm điều gì?', related);
      }

      // ─── 5. Tạm biệt ───
      if (/\b(tam biet|bye|goodbye|hen gap lai|di nhe)\b/.test(q)) {
        return result('Chúc bạn có chuyến đi nhiều kỷ niệm đẹp! 🌟 Nhớ lưu hành trình trước khi rời trang nhé.');
      }

      // ─── 6. Trợ giúp / Bạn là ai ───
      if (/\b(ban la ai|la ai|ban co the lam gi|giup gi|huong dan|tro giup|help|can giup|ho tro)\b/.test(q)) {
        return result(
          'Mình là **Tripmate** — trợ lý du lịch Việt Nam. Bạn có thể hỏi:\n\n' +
          '📍 **Điểm đến**: "Giới thiệu Hội An", "Địa điểm ở Bình Định"\n' +
          '🍜 **Ẩm thực**: "Ăn gì ở Hà Nội?", "Đặc sản Huế"\n' +
          '💰 **Chi phí**: "Chi phí chuyến đi", "Điểm đến rẻ nhất"\n' +
          '🔄 **So sánh**: "So sánh Đà Nẵng và Đà Lạt"\n' +
          '📋 **Lịch trình**: "Xem ngày 2", "Sáng ngày 1 đi đâu?"\n' +
          '✏️ **Điều chỉnh**: "Đổi địa điểm ngày 2", "Giảm chi phí"\n' +
          '🎒 **Tips**: "Mẹo du lịch Hà Giang", "Đi Đà Lạt bằng gì?"\n' +
          '🌸 **Mùa đẹp**: "Khi nào đi Hà Giang đẹp?"\n' +
          '👨‍👩‍👧 **Đối tượng**: "Đi với gia đình nên đi đâu?"\n\n' +
          'Mình dùng dữ liệu có sẵn, chưa kết nối AI trực tiếp.',
          ['Gợi ý điểm đến', 'Chi phí chuyến đi', 'So sánh Đà Nẵng và Đà Lạt']
        );
      }

      // ─── 7. Thời tiết ───
      if (/\b(thoi tiet|du bao|troi mua|nhiet do|troi nang|troi lanh|mua bao)\b/.test(q)) {
        const reply = tips
          ? 'Mình chưa có dữ liệu thời tiết trực tiếp, nhưng **' + d.name + '** thường đẹp nhất vào **' + tips.bestTime + '**.\n\nNên kiểm tra dự báo gần ngày đi và chuẩn bị phương án dự phòng nhé.'
          : 'Mình chưa có dữ liệu thời tiết trực tiếp. Bạn nên kiểm tra dự báo gần ngày đi và chuẩn bị phương án nghỉ ngơi hoặc tham quan trong nhà khi thời tiết không thuận lợi.';
        return result(reply, related);
      }

      // ─── 8. So sánh điểm đến ───
      if (/\b(so sanh|hay la|vs|versus|khac gi|giong gi)\b/.test(q) || (/\b(nen di)\b/.test(q) && /\bhay\b/.test(q))) {
        const multi = extractMultipleDestinations(q);
        if (multi.length >= 2) {
          comparison = null;
          const [id1, d1] = multi[0];
          const [id2, d2] = multi[1];
          const cost1 = dailyCost(d1), cost2 = dailyCost(d2);
          const tips1 = travelTips[id1], tips2 = travelTips[id2];
          let reply = '**So sánh ' + d1.name + ' vs ' + d2.name + ':**\n\n';
          reply += '| | ' + d1.name + ' | ' + d2.name + ' |\n';
          reply += '|---|---|---|\n';
          reply += '| Lưu trú/đêm | ' + money(d1.stay) + ' | ' + money(d2.stay) + ' |\n';
          reply += '| Ăn uống/ngày | ' + money(d1.food) + ' | ' + money(d2.food) + ' |\n';
          reply += '| Di chuyển/ngày | ' + money(d1.transport) + ' | ' + money(d2.transport) + ' |\n';
          reply += '| **Tổng/ngày** | **' + money(cost1) + '** | **' + money(cost2) + '** |\n';
          reply += '| Số hoạt động | ' + d1.places.length + ' | ' + d2.places.length + ' |\n';
          if (tips1?.bestTime || tips2?.bestTime) {
            reply += '| Mùa đẹp | ' + (tips1?.bestTime || '—') + ' | ' + (tips2?.bestTime || '—') + ' |\n';
          }
          reply += '\n' + (cost1 < cost2
            ? '💡 **' + d1.name + '** có chi phí thấp hơn khoảng ' + money(cost2 - cost1) + '/ngày.'
            : cost2 < cost1
              ? '💡 **' + d2.name + '** có chi phí thấp hơn khoảng ' + money(cost1 - cost2) + '/ngày.'
              : '💡 Hai điểm đến có chi phí tương đương.');
          reply += '\n\nCác mức trên là dữ liệu mẫu cho một người, chưa gồm vé đến, phí hoạt động và dự phòng.';
          return result(reply, ['Giới thiệu ' + d1.name, 'Giới thiệu ' + d2.name, 'Chi phí chuyến đi']);
        }
        if (multi.length === 1) {
          comparison = multi[0][0];
          return result('Bạn muốn so sánh **' + multi[0][1].name + '** với điểm đến nào? Ví dụ: "So sánh ' + multi[0][1].name + ' và Đà Lạt".',
            entries.filter(([eid]) => eid !== multi[0][0]).slice(0, 3).map(([, ed]) => 'So sánh ' + multi[0][1].name + ' và ' + ed.name));
        }
        return result('Bạn muốn so sánh điểm đến nào? Ví dụ: "So sánh Đà Nẵng và Đà Lạt".', defaults);
      }

      // ─── 9. Gợi ý theo ngân sách ───
      if (/\b(re nhat|re|tiet kiem nhat|ngan sach thap|it tien|bao nhieu tien|voi \d|trieu|gia re)\b/.test(q) && /\b(di dau|diem den|dia diem|goi y|nen di|cho nao)\b/.test(q)) {
        const budgetMatch = q.match(/(\d+)\s*(trieu|tr)/);
        const sorted = entries
          .filter(([id]) => detailedIds.includes(id))
          .sort((a, b) => dailyCost(a[1]) - dailyCost(b[1]));
        if (budgetMatch) {
          const budget = Number(budgetMatch[1]) * 1000000;
          const affordable = sorted.filter(([, dest]) => dailyCost(dest) <= budget / 2);
          if (affordable.length) {
            return result(
              '💰 Điểm đến phù hợp ngân sách **' + budgetMatch[1] + ' triệu/người**:\n' +
              affordable.map(([, dest]) => '• **' + dest.name + '** — ~' + money(dailyCost(dest)) + '/ngày/người').join('\n') +
              '\n\n(Chi phí gồm lưu trú + ăn uống + di chuyển tại điểm đến, chưa gồm vé đến)',
              affordable.slice(0, 3).map(([, dest]) => 'Giới thiệu ' + dest.name)
            );
          }
        }
        return result(
          '💰 **Điểm đến xếp theo chi phí từ thấp đến cao:**\n' +
          sorted.slice(0, 6).map(([, dest], i) => (i + 1) + '. **' + dest.name + '** — ~' + money(dailyCost(dest)) + '/ngày/người').join('\n') +
          '\n\n(Dự toán mẫu: lưu trú + ăn uống + di chuyển tại điểm đến)',
          sorted.slice(0, 3).map(([, dest]) => 'Giới thiệu ' + dest.name)
        );
      }

      // ─── 10. Gợi ý theo thời gian (1 ngày, cuối tuần, dài ngày) ───
      if (/\b(1 ngay|mot ngay|cuoi tuan|2 ngay|hai ngay|ngan ngay|dai ngay|nhieu ngay|it ngay)\b/.test(q) && /\b(di dau|nen di|goi y|cho nao|diem den)\b/.test(q)) {
        const isShort = /\b(1 ngay|mot ngay|cuoi tuan|2 ngay|hai ngay|ngan ngay|it ngay)\b/.test(q);
        const shortTrips = entries.filter(([id]) => ['danang', 'dalat', 'hanoi', 'hoian', 'cantho'].includes(id));
        const longTrips = entries.filter(([id]) => ['hagiang', 'caobang', 'halong', 'hue', 'lyson'].includes(id));
        const list = isShort ? shortTrips : longTrips;
        return result(
          (isShort ? '⏱️ **Điểm đến phù hợp cho chuyến ngắn (1–2 ngày):**' : '🗓️ **Điểm đến nên dành nhiều ngày (3+ ngày):**') + '\n' +
          list.map(([, dest]) => '• **' + dest.name + '** — ~' + money(dailyCost(dest)) + '/ngày/người').join('\n') +
          (isShort ? '\n\n💡 Chuyến ngắn nên chọn nơi gần, dễ di chuyển.' : '\n\n💡 Chuyến dài giúp trải nghiệm sâu hơn, tận hưởng cảnh đẹp thiên nhiên.'),
          list.slice(0, 3).map(([, dest]) => 'Giới thiệu ' + dest.name)
        );
      }

      // ─── 11. Đếm / thống kê ───
      if (/\b(bao nhieu|may|so luong|tong|dem|thong ke)\b/.test(q) && /\b(diem den|dia diem|hoat dong|places|noi|cho)\b/.test(q)) {
        if (d && /\b(hoat dong|places|cho choi|diem)\b/.test(q)) {
          const tags = {};
          d.places.forEach(p => { tags[p[1]] = (tags[p[1]] || 0) + 1; });
          return result(
            '📊 **' + d.name + '** có **' + d.places.length + ' hoạt động** trong dữ liệu:\n' +
            Object.entries(tags).map(([t, c]) => '• ' + t + ': ' + c).join('\n'),
            ['Có gì chơi ở ' + d.name, 'Hoạt động miễn phí ' + d.name]
          );
        }
        const detailedCount = entries.filter(([id]) => detailedIds.includes(id)).length;
        return result(
          '📊 Tripmate hiện có **' + entries.length + ' điểm đến** trong dữ liệu:\n' +
          '• ' + detailedCount + ' điểm đến có thông tin chi tiết (tips, phương tiện, mùa đẹp)\n' +
          '• ' + (entries.length - detailedCount) + ' điểm đến từ bộ dữ liệu DLDT\n\n' +
          'Nhắn tên tỉnh/thành phố để xem chi tiết.',
          ['Gợi ý điểm đến', 'Điểm đến rẻ nhất']
        );
      }

      // ─── 12. Hoạt động miễn phí ───
      if (/\b(mien phi|khong mat phi|khong ton tien|free|0 dong|khong mat tien)\b/.test(q)) {
        if (!d) return result('Bạn muốn xem hoạt động miễn phí ở đâu? Nhắn tên địa điểm nhé.');
        const free = freePlaces(d);
        if (!free.length) return result('Dữ liệu ' + d.name + ' hiện chưa có hoạt động miễn phí được ghi nhận.', related);
        return result(
          '🆓 **Hoạt động có dự toán 0 đồng tại ' + d.name + ':**\n' +
          free.slice(0, 8).map(p => '• ' + p[0] + ' (' + p[1] + ')').join('\n') +
          '\n\n0 đồng là khoản chưa tính phí trong dữ liệu mẫu, không xác nhận hoạt động miễn phí thực tế.',
          ['Chi phí tại ' + d.name, 'Có gì chơi ở ' + d.name]
        );
      }

      // ─── 13. Mùa đẹp / thời điểm đi ───
      if (/\b(mua|thoi diem|khi nao|bao gio|thang may|di luc nao|dep nhat)\b/.test(q) && /\b(di|dep|tot|nen|hay)\b/.test(q)) {
        if (tips) {
          return result(
            '🌸 **Thời điểm đẹp nhất đi ' + d.name + ':**\n' + tips.bestTime + '\n\n' +
            (tips.tips[0] ? '💡 ' + tips.tips[0] : ''),
            ['Tips du lịch ' + d.name, 'Chi phí tại ' + d.name]
          );
        }
        // Show best times for all detailed destinations
        const list = detailedIds.filter(did => travelTips[did]?.bestTime).slice(0, 6);
        return result(
          '🌸 **Thời điểm đẹp cho các điểm đến:**\n' +
          list.map(did => '• **' + E.destinations[did].name + '**: ' + travelTips[did].bestTime).join('\n'),
          list.slice(0, 3).map(did => 'Khi nào đi ' + E.destinations[did].name + ' đẹp?')
        );
      }

      // ─── 14. Phương tiện di chuyển ───
      if (/\b(di bang gi|bang gi|phuong tien|xe khach|may bay|tau hoa|xe may|grab|taxi|cach di|lam sao di|di den|di .+ bang)\b/.test(q)) {
        if (tips?.transport) {
          return result(
            '🚗 **Phương tiện đến ' + d.name + ':**\n' +
            tips.transport.map(t => '• ' + t).join('\n') +
            '\n\nChi phí di chuyển nội bộ tại điểm đến: ~' + money(d.transport) + '/người/ngày.',
            ['Tips du lịch ' + d.name, 'Chi phí tại ' + d.name]
          );
        }
        if (d) {
          return result(
            'Mình chưa có dữ liệu phương tiện chi tiết đến **' + d.name + '**. Chi phí di chuyển nội bộ tại điểm đến ước tính ~' + money(d.transport) + '/người/ngày.\n\nBạn có thể tra trên Google Maps hoặc 12GoAsia để tìm phương tiện phù hợp.',
            related
          );
        }
        return result('Bạn muốn biết phương tiện đi đến đâu? Nhắn tên địa điểm nhé.', defaults);
      }

      // ─── 15. Tips / mẹo du lịch ───
      if (/\b(tips|meo|luu y|can chuan bi|kinh nghiem|bi quyet|nen biet)\b/.test(q)) {
        if (tips) {
          return result(
            '🎒 **Mẹo du lịch ' + d.name + ':**\n' +
            tips.tips.map(t => '• ' + t).join('\n') +
            '\n\n⏰ **Mùa đẹp**: ' + tips.bestTime,
            ['Đi ' + d.name + ' bằng gì?', 'Ăn gì ở ' + d.name, 'Chi phí tại ' + d.name]
          );
        }
        if (d) {
          return result(
            '🎒 Mình chưa có tips chi tiết cho **' + d.name + '**. Một số mẹo chung:\n' +
            '• Kiểm tra thời tiết trước khi đi\n' +
            '• Mang giày thoải mái, kem chống nắng\n' +
            '• Lưu bản đồ offline trên Google Maps\n' +
            '• Đặt chỗ trước vào mùa cao điểm',
            related
          );
        }
        return result('Bạn muốn xem tips du lịch cho điểm đến nào?', defaults);
      }

      // ─── 16. Gợi ý theo đối tượng (gia đình, cặp đôi, nhóm bạn...) ───
      if (/\b(gia dinh|cap doi|nhom ban|solo|phuot|mot minh|tre em|tre nho|nguoi lon tuoi)\b/.test(q) && /\b(nen di|di dau|goi y|phu hop|cho|diem den)\b/.test(q)) {
        const audienceKey = Object.keys(audienceLabels).find(k => q.includes(k));
        const label = audienceKey ? audienceLabels[audienceKey] : 'bạn';
        const suitable = detailedIds.filter(did => travelTips[did]?.audience?.some(a =>
          normalize(a).includes(normalize(label).split(' ')[0]) ||
          normalize(label).includes(normalize(a).split(' ')[0])
        ));
        if (suitable.length) {
          return result(
            '👨‍👩‍👧 **Điểm đến phù hợp cho ' + label + ':**\n' +
            suitable.map(did => '• **' + E.destinations[did].name + '** — ~' + money(dailyCost(E.destinations[did])) + '/ngày/người').join('\n'),
            suitable.slice(0, 3).map(did => 'Giới thiệu ' + E.destinations[did].name)
          );
        }
        return result('Mình chưa có gợi ý cụ thể cho ' + label + '. Thử hỏi "Gợi ý điểm đến" để xem tất cả nhé.', defaults);
      }

      // ─── 17. An toàn ───
      if (/\b(an toan|an ninh|nguy hiem|canh giac|trom cap|lua dao)\b/.test(q)) {
        return result(
          '🛡️ **Lưu ý an toàn khi du lịch:**\n' +
          safetyTips.map(t => '• ' + t).join('\n') +
          (d ? '\n\nVới **' + d.name + '**, hãy tìm hiểu thêm tình hình địa phương trước khi đi.' : ''),
          related
        );
      }

      // ─── 18. Đặt phòng / lưu trú ───
      if (/\b(dat phong|dat ve|khach san|homestay|luu tru|nha nghi|resort)\b/.test(q)) {
        return result(
          d
            ? '🏨 Dự toán lưu trú tại **' + d.name + '**: ~' + money(d.stay) + '/người/đêm.\n\n' +
              'Mình chưa có danh sách cơ sở lưu trú cụ thể. Gợi ý đặt phòng:\n' +
              '• Booking.com, Agoda cho khách sạn/resort\n' +
              '• Airbnb cho homestay/nhà riêng\n' +
              '• Đặt sớm 2–4 tuần trước, đặc biệt mùa cao điểm'
            : 'Mình chưa hỗ trợ đặt phòng. Nhắn tên điểm đến để xem dự toán lưu trú.',
          related
        );
      }

      // ─── 19. Giờ mở cửa / giá vé / chỉ đường ───
      if (/\b(gio mo cua|gio dong cua|gia ve|ve vao|dia chi|toa do|chi duong|bao xa|di chuyen|di bang)\b/.test(q)) {
        return result(
          'Dữ liệu hiện chưa có giờ mở cửa, giá vé xác minh, tọa độ và tuyến di chuyển đầy đủ' +
          (d ? ' cho **' + d.name + '**' : '') +
          '.\n\nCác khoản trong lịch trình là dự toán mẫu. Gợi ý:\n' +
          '• Tra Google Maps để xem giờ mở cửa và chỉ đường\n' +
          '• Gọi điện xác nhận với địa điểm trước khi đi',
          related
        );
      }

      // ─── 20. Lịch trình sinh hoạt (ăn, ngủ, nghỉ lúc mấy giờ) ───
      if (/\b(ngu|nghi ngoi|nghi trua|an sang|an trua|an toi|may gio)\b/.test(q) && plan && !matches.length) {
        const number = q.match(/ngay\s+(\d+)/);
        const index = number ? Number(number[1]) - 1 : 0;
        if (index < 0 || index >= plan.days.length)
          return result('Hãy chọn ngày từ 1 đến ' + plan.days.length + '.');
        const agenda = E.scheduleDay ? E.scheduleDay(plan, index) : plan.days[index].activities;
        return result(
          '⏰ **Khung giờ gợi ý ngày ' + (index + 1) + ':**\n' +
          agenda.filter(a => a.supplemental).map(a => '• ' + a.time + ': ' + a.name).join('\n') +
          '\n\nĂn uống và lưu trú đã nằm trong dự toán. Giờ là gợi ý, chưa đối chiếu giờ mở cửa.',
          related
        );
      }

      // ─── 21. Hành lý / chuẩn bị ───
      if (/\b(chuan bi|mang gi|hanh ly|dong do|checklist)\b/.test(q)) {
        let reply = '🎒 **Checklist hành lý gợi ý:**\n' +
          '• 📄 Giấy tờ tùy thân (CMND/CCCD/Hộ chiếu)\n' +
          '• 👟 Giày dễ đi, dép thoải mái\n' +
          '• 🧴 Kem chống nắng, nước uống\n' +
          '• 🔌 Sạc dự phòng, sạc điện thoại\n' +
          '• 💊 Thuốc cá nhân, thuốc chống say xe\n' +
          '• 🧥 Áo khoác mỏng / áo mưa\n' +
          '• 📱 Bản đồ offline trên Google Maps';
        if (tips) {
          reply += '\n\n💡 **Riêng ' + d.name + '**: ' + tips.tips[tips.tips.length - 1];
        }
        return result(reply, related);
      }

      // ─── 22. Ăn chay / dị ứng ───
      if (/\b(an chay|di ung|kieng an|khong an duoc)\b/.test(q)) {
        return result(
          'Bạn có thể chọn món phù hợp chế độ ăn và hỏi rõ thành phần, nước dùng, nước chấm với quán.\n\n' +
          '💡 Mẹo:\n' +
          '• Nhà hàng chay phổ biến ở các thành phố lớn\n' +
          '• Nói rõ dị ứng trước khi gọi món\n' +
          '• Chuẩn bị đồ ăn dự phòng cho vùng xa',
          related
        );
      }

      // ─── 23. Visa / hộ chiếu ───
      if (/\b(visa|thi thuc|ho chieu|nhap canh|xuat canh)\b/.test(q)) {
        return result(
          'Tripmate chưa tra cứu quy định nhập cảnh trực tiếp.\n\n' +
          '💡 Giấy tờ cần thiết phụ thuộc hành khách, phương tiện và cơ sở lưu trú; hãy kiểm tra yêu cầu của đơn vị cung cấp.\n' +
          'Nếu đi nước ngoài hoặc là khách quốc tế: kiểm tra hướng dẫn visa theo quốc tịch và ngày đi.',
          related
        );
      }

      // ─── 24. Lưu / xóa lịch trình ───
      if (/\b(luu|xoa)\b/.test(q) && /\b(lich trinh|hanh trinh|chuyen di)\b/.test(q)) {
        return result(
          '💾 Hướng dẫn:\n' +
          '• Bấm **"♡ Lưu hành trình"** để lưu trên trình duyệt này\n' +
          '• Vào trang **"Lịch trình của tôi"** để mở hoặc xóa hành trình\n' +
          '• Tin nhắn này không tự lưu hoặc xóa dữ liệu',
          ['Xem lịch trình', 'Chi phí chuyến đi']
        );
      }

      // ─── 25. Tóm tắt buổi cụ thể (sáng/chiều/tối ngày X) ───
      if (/\b(sang|chieu|toi)\s+(?:cua )?ngay\s+\d+\b/.test(q) && plan) {
        const dayNum = Number(q.match(/ngay\s+(\d+)/)[1]);
        const slotMatch = q.match(/\b(sang|chieu|toi)\s+(?:cua )?ngay/);
        if (dayNum >= 1 && dayNum <= plan.days.length && slotMatch) {
          const slot = slotMatch[1] === 'sang' ? 0 : slotMatch[1] === 'chieu' ? 1 : 2;
          const slotLabel = ['Sáng', 'Chiều', 'Tối'][slot];
          const activity = plan.days[dayNum - 1].activities[slot];
          const schedule = E.scheduleDay ? E.scheduleDay(plan, dayNum - 1) : null;
          const coreSlots = schedule ? schedule.filter(a => !a.supplemental) : [];
          const core = coreSlots[slot];
          return result(
            '📌 **' + slotLabel + ' ngày ' + dayNum + ':**\n' +
            '• ' + (core?.time || activity.time) + ': **' + activity.name + '**\n' +
            '• Loại: ' + activity.tag + '\n' +
            '• Chi phí: ' + (activity.cost ? money(activity.cost) + '/người' : 'Chưa tính phí trong dữ liệu mẫu') +
            (activity.image ? '\n\n📷 Có ảnh minh họa trong lịch trình chi tiết.' : ''),
            ['Xem ngày ' + dayNum, 'Đổi địa điểm ngày ' + dayNum, 'Chi phí chuyến đi']
          );
        }
      }

      // ─── 26. Điều chỉnh lịch trình (đổi ngày / giảm chi phí) ───
      if (/\b(doi (dia diem |hoat dong )?ngay|thay (doi |hoat dong )?ngay|giam (chi phi|ngan sach)|tiet kiem|re hon)\b/.test(q)) {
        if (/\b(doi|thay)\b/.test(q) && !/\bngay\s+\d+\b/.test(q))
          return result('Để đổi hoạt động, hãy nhắn **"Đổi địa điểm ngày 2"**.\nĐể đổi điểm đến, số ngày, số người hoặc ngân sách → mở trang Tạo lịch trình rồi tạo lại.',
            plan ? plan.days.map((_, i) => 'Đổi địa điểm ngày ' + (i + 1)) : defaults);
        try {
          const action = E.command(plan, q);
          if (action) return { ...action, suggestions: ['Xem lịch trình', 'Chi phí chuyến đi'] };
        } catch (error) { return result(error.message, ['Xem lịch trình']); }
      }

      // ─── 27. Xem / tóm tắt lịch trình ───
      if (/\b(xem|tom tat|lich trinh|hanh trinh)\b/.test(q) && !matches.length) {
        if (!plan) return result('Bạn hãy tạo một lịch trình trước nhé. Vào trang **Tạo lịch trình** để bắt đầu.');
        const number = q.match(/\bngay\s+(\d+)\b/);
        const days = number ? plan.days.filter((_, i) => i + 1 === Number(number[1])) : plan.days;
        if (!days.length) return result('Lịch trình hiện có ' + plan.days.length + ' ngày. Hãy chọn ngày từ 1 đến ' + plan.days.length + '.');
        return result(
          '📋 **Lịch trình' + (number ? ' ngày ' + number[1] : '') + ':**\n\n' +
          days.map(day =>
            '**Ngày ' + day.number + ':**\n' +
            (E.scheduleDay ? E.scheduleDay(plan, plan.days.indexOf(day)) : day.activities)
              .map(a => '• ' + a.time + ': ' + a.name).join('\n')
          ).join('\n\n'),
          ['Chi phí chuyến đi', 'Đổi địa điểm ngày 1']
        );
      }

      // ─── 28. Chi phí ───
      if (/\b(chi phi|ngan sach|bao nhieu|du toan|ton kem|gia|tien)\b/.test(q) && !/\b(di dau|nen di|goi y|cho nao)\b/.test(q)) {
        if (matches.length || (focus && d && !/\b(chuyen di|lich trinh|hanh trinh|ca nhom)\b/.test(q))) {
          return result(
            '💰 **Dự toán mẫu tại ' + d.name + ':**\n' +
            '• Lưu trú: ' + money(d.stay) + '/người/đêm\n' +
            '• Ăn uống: ' + money(d.food) + '/người/ngày\n' +
            '• Di chuyển tại điểm đến: ' + money(d.transport) + '/người/ngày\n' +
            '• **Tổng ~' + money(dailyCost(d)) + '/người/ngày**\n\n' +
            'Chưa gồm vé đến điểm đến và chi phí hoạt động. Đây là dự toán mẫu.',
            ['Hoạt động miễn phí ' + d.name, 'So sánh ' + d.name + ' với nơi khác', 'Giảm chi phí']
          );
        }
        if (!plan) return result('Hãy tạo lịch trình để mình tính chi phí theo số ngày và số người.');
        const c = E.costs(plan);
        return result(
          '💰 **Dự toán cho ' + plan.input.people + ' người, ' + plan.input.days + ' ngày:**\n' +
          '• Tổng: **' + money(c.total) + '**\n' +
          '• Mỗi người: ' + money(c.totalPerPerson) + '\n' +
          '• Ngân sách cả nhóm: ' + money(c.budgetTotal) + '\n' +
          '• ' + (c.over ? '⚠️ Vượt ngân sách **' + money(c.total - c.budgetTotal) + '**' : '✅ Còn dư **' + money(c.budgetTotal - c.total) + '**') + '\n\n' +
          'Chi phí mẫu, chưa gồm vé đến điểm đến.',
          c.over ? ['Giảm chi phí', 'Xem lịch trình'] : ['Xem lịch trình', 'Lưu hành trình']
        );
      }

      // ─── 29. Ẩm thực / Có gì chơi / Check-in ───
      if (/\b(an gi|am thuc|mon an|dac san|co gi choi|lam gi|hoat dong|check in|chup anh|tham quan|kham pha)\b/.test(q)) {
        if (!d) return result('Bạn muốn hỏi hoạt động ở địa điểm nào? Nhắn tên tỉnh/thành phố nhé.');
        const tag = /\b(an gi|am thuc|mon an|dac san)\b/.test(q) ? 'Ẩm thực'
          : /\b(check in|chup anh)\b/.test(q) ? 'Check-in'
          : /\b(tham quan|kham pha|van hoa)\b/.test(q) ? 'Văn hóa'
          : /\b(thien nhien)\b/.test(q) ? 'Thiên nhiên'
          : /\b(bien)\b/.test(q) ? 'Biển'
          : null;
        const places = d.places.filter(p => !tag || p[1] === tag).slice(0, 8);
        const tagLabel = tag || 'hoạt động';
        return result(
          places.length
            ? '🎯 **' + tagLabel + ' tại ' + d.name + ':**\n' +
              places.map(p => '• ' + p[0] + (p[2] > 0 ? ' — ' + money(p[2]) + '/người' : ' — Chưa tính phí trong dữ liệu mẫu')).join('\n') +
              (tips ? '\n\n💡 ' + tips.tips[0] : '')
            : 'Dữ liệu của **' + d.name + '** chưa có gợi ý ' + tagLabel + ' cụ thể. Bạn có thể hỏi về hoạt động khác tại đây.',
          [
            'Chi phí tại ' + d.name,
            'Hoạt động miễn phí ' + d.name,
            tag !== 'Ẩm thực' ? 'Ăn gì ở ' + d.name : 'Có gì chơi ở ' + d.name,
          ]
        );
      }

      // ─── 30. Tra cứu theo vùng miền ───
      const regions = [...new Set(entries.map(([, d]) => d.region).filter(Boolean))];
      const region = regions.filter(r => (' ' + q + ' ').includes(' ' + normalize(r) + ' '))
        .sort((a, b) => b.length - a.length)[0];
      if (region && !matches.length) {
        const list = entries.filter(([, d]) => d.region === region).slice(0, 8);
        return result(
          '📍 **Các điểm đến thuộc ' + region + ':**\n' +
          list.map(([, d]) => '• ' + d.name).join('\n'),
          list.slice(0, 3).map(([, d]) => 'Giới thiệu ' + d.name)
        );
      }

      // ─── 31. Giới thiệu điểm đến ───
      if (matches.length || /\b(gioi thieu|o do|noi do|dia diem nay|ke ve|noi ve)\b/.test(q)) {
        if (!d) return result('Bạn muốn mình giới thiệu địa điểm nào? Nhắn tên tỉnh/thành phố nhé.');
        let reply = '📍 **' + d.name + '**' + (d.region ? ' · ' + d.region : '') + '\n\n';
        reply += d.description || 'Một điểm đến trong bộ dữ liệu Tripmate.';
        reply += '\n\n🎯 **Hoạt động nổi bật**: ' + d.places.slice(0, 4).map(p => p[0]).join(', ');
        reply += '\n💰 **Chi phí/ngày**: ~' + money(dailyCost(d)) + '/người';
        if (tips) {
          reply += '\n⏰ **Mùa đẹp**: ' + tips.bestTime;
          reply += '\n💡 ' + tips.tips[0];
        }
        return result(reply, [
          'Có gì chơi ở ' + d.name,
          'Chi phí tại ' + d.name,
          tips ? 'Tips du lịch ' + d.name : 'Gợi ý điểm đến',
        ]);
      }

      // ─── 32. Gợi ý điểm đến chung / theo tag ───
      if (/\b(goi y|di dau|diem den|dia diem|di bien|thien nhien|van hoa|nui|dao)\b/.test(q)) {
        const tag = /\bbien\b/.test(q) || /\bdao\b/.test(q) ? 'Biển'
          : /\bthien nhien\b/.test(q) || /\bnui\b/.test(q) ? 'Thiên nhiên'
          : /\bvan hoa\b/.test(q) ? 'Văn hóa'
          : /\bam thuc\b/.test(q) ? 'Ẩm thực'
          : /\bcheck in\b/.test(q) ? 'Check-in'
          : null;
        const list = tag
          ? entries.filter(([, d]) => d.places.some(p => p[1] === tag)).slice(0, 8)
          : entries.filter(([id]) => detailedIds.includes(id));
        const tagLabel = tag ? tag.toLowerCase() : 'nổi bật';
        return result(
          '🌏 **Điểm đến ' + tagLabel + ':**\n' +
          list.map(([, d]) => '• **' + d.name + '** — ~' + money(dailyCost(d)) + '/ngày/người').join('\n') +
          '\n\nNhắn tên địa điểm để xem chi tiết.',
          list.slice(0, 3).map(([, d]) => 'Giới thiệu ' + d.name)
        );
      }

      // ─── 33. Câu hỏi không liên quan đến du lịch ───
      if (/\b(thu do|tong thong|nuoc|1\+1|tinh toan|so hoc|lich su the gioi|khoa hoc|cong nghe)\b/.test(q)) {
        return result(
          'Mình là trợ lý chuyên về **du lịch Việt Nam** thôi nha! 😄\n\n' +
          'Hãy hỏi mình về điểm đến, ẩm thực, lịch trình, chi phí... và mình sẽ hỗ trợ hết sức.',
          defaults
        );
      }

      // ─── SMART FALLBACK ───
      {
        // Try to suggest relevant questions based on keywords in the query
        const hints = [];
        if (/\ban\b|mon|do an/.test(q)) hints.push('Ăn gì ở ' + (d?.name || 'Đà Nẵng') + '?');
        if (/phi|tien|gia/.test(q)) hints.push('Chi phí chuyến đi');
        if (/choi|lam/.test(q)) hints.push('Có gì chơi ở ' + (d?.name || 'Hội An') + '?');
        if (/dep|anh|hinh/.test(q)) hints.push('Điểm check-in nổi tiếng');
        if (/ngay|lich/.test(q) && plan) hints.push('Xem lịch trình');
        if (/di|den|toi/.test(q)) hints.push('Gợi ý điểm đến');

        const suggestions = hints.length >= 2
          ? hints.slice(0, 3)
          : d
            ? ['Giới thiệu ' + d.name, 'Có gì chơi ở ' + d.name, 'Chi phí chuyến đi']
            : defaults;

        return result(
          'Mình chưa hiểu rõ câu hỏi này. 🤔 Bạn có thể thử:\n' +
          suggestions.map(s => '• "' + s + '"').join('\n') +
          '\n\nHoặc nhắn **"Trợ giúp"** để xem tất cả những gì mình có thể hỗ trợ.',
          suggestions
        );
      }
    }

    return {
      respond,
      reset() {
        focus = null;
        pendingTopic = comparison = budgetQuestion = null;
        try { root.sessionStorage?.removeItem('tripmate.chat-focus.v1'); } catch {}
      }
    };
  }

  const api = { create, normalize };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.TripMateChatbot = api;
})(typeof window !== 'undefined' ? window : globalThis);
