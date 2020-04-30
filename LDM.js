// ==UserScript==
// @name         洛谷讨论标记器 Luogu Discuss Marker
// @namespace    http://icelava.top/
// @version      alpha 0.1
// @description  还你一个和谐有序的洛谷讨论区
// @author       ForkKILLET (Luogu: id = ForkΨKILLET, uid = 125210)
// @match        *://www.luogu.com.cn/discuss/lists?*
// @match        *://www.luogu.com.cn/discuss/lists
// @grant        unsafeWindow
// @grant        GM_getValue
// @grant        GM_setValue
// ==/UserScript==

var ef = ucw => ucw + is + "our red sun", is =
{
    num: v => typeof v === "number",
    empty: v => v == null,
    func: v => typeof v === "function",
    array: v => Array.isArray(v)
}, data =
{
    def: (n, d) =>
        Object.defineProperty(data, n,
        {
            get: () => GM_getValue(n, d),
            set: v => GM_setValue(n, v)
        })
};

(() =>
{
    unsafeWindow.LDM =
    {
        debug: true,
        test_discuss_id: 219757, // Disable: 218189
        get_mark_data_by_name: n =>
        {
            for (let i in LDM.mark_data) if (LDM.mark_data[i].name.includes(n)) return [LDM.mark_data[i], i];
            return null;
        },
        mark_data:
        [
            {
                name: ["ldm", "谷论标", "glb", "洛谷讨论标记器", "LuoguDiscussMarker"],
                white: ["ldmdt"],
                len: 1,
                wei: 1,
                vlv: 0,
                evil: false,
                color: "green"
            },
            {
                name: ["usl", "无意义", "wyy", "无意义的内容", "Useless"],
                black: ["author"],
                len: 10,
                wei: 33,
                vlv: 0,
                evil: true,
                color: "orange"
            },
            {
                name: ["mlt", "屑标题", "xbt", "人间之屑标题", "MeaninglessTitle"],
                black: ["author"],
                len: 10,
                wei: 20,
                vlv: 0,
                evil: true,
                color: "brown"
            },
            {
                name: ["pdt", "板漂学", "bpx", "板块漂移学说", "PlateDriftTheory"],
                black: ["author"],
                len: 10,
                wei: 20,
                vlv: 0,
                evil: true,
                color: "yellow"
            },
            {
                name: ["usf", "有帮助", "ybz", "能帮助到我", "Useful"],
                black: ["author"],
                len: 15,
                wei: 43,
                vlv: 1,
                evil: false,
                color: "red"
            },
            {
                name: ["end", "已完结", "ywj", "可以来考古了", "Enderman"],
                white: ["author", "root"],
                len: 20,
                wei: 1,
                vlv: 0,
                evil: false,
                color: "pink"
            },
            {
                name: ["god", "是神贴", "sst", "愣着干嘛留名啊", "HotContent"],
                black: ["author"],
                len: 25,
                wei: 33,
                vlv: -2,
                evil: false
            }
        ],
        delay: 500, // Info: 该值不得低于 400，否则你的 console 会很美丽
        page_cool_down: 0,
        _process_page: (id, pg = 1, cb = null, pcr = null) =>
        {
            if (!is.num(id)) throw `postid 传错了，应该是数字，憨憨！拿着你的 ${typeof id} 爪巴！`;
            if (!is.num(pg)) throw `页数传错了，也应该是数字，脑瘫！拿着你的 ${typeof pg} 爪巴！`;

            if (pg === 0) return; // Note: 莫得回复

            // Note: AJAX 走起！
            $.ajax({
                url: `/discuss/show?postid=${id}?page=${pg}`,
                success: res =>
                {
                    console.log(`LDM AJAX to ${id}: ${pg} successfully!`);

                    let beg = res.indexOf(`<div class="lg-content-left">`),
                        _end = res.indexOf(`<div class="pagination-centered">`),
                        end = _end < 0 ? res.indexOf(`<div class="lg-article" id="replyarea">`) : _end,
                        _res = `<div class="analysis_element">${res.substring(beg, end)}</div></div>`,
                        $analysis = $(_res), $replies,
                        reply_params = [];
                    $("body").append($analysis);
                    $replies = $analysis.find("article");

                    // Note: 遍历所有回复。
                    for (let i = 0; i < $replies.length; i++)
                    {
                        if (is.array(pcr))
                        {
                            // Note: 处理回复数据。
                            let $i = $($replies[i]), $h = $i.find(".am-comment-meta"), $v = $h.find("svg"), $b = $i.find(".am-comment-bd"), $n = $h.find("span.am-badge");
                            reply_params[i] = {};
                            let p = reply_params[i];
                            p.rank = i;
                            p.element = $replies[i];
                            p.selector = $i;
                            p.user_name = $h.find("a:nth-child(2)").html();
                            p.user_id = parseInt($h.find("a:nth-child(2)").attr("href").substring(6));
                            p.root_title = p.is_root ? $n.html() : null;
                            p.is = {};
                            p.is.author = $i.is(".am-comment-danger");
                            p.is.root = !!$n.length;
                            p.is.now_root = $n.is(".lg-bg-purple");
                            p.is.ldmdt = [125210].includes(p.user_id);
                            // QAQ:
                            // let ldmdt === "Luogu Discuss Marker Develop Team";
                            // Contact ForkKILLET to join ldmdt ~
                            // Luogu: id = ForkΨKILLET, uid = 125210
                            // Github: id = ForkFG, nm = ForkKILLET
                            // Email: addr = fork_killet@qq.com
                            // QQ: id = ForkKILLET, no = 1096694717
                            // QQ Group: id = IceLava, no = 774225409
                            p.v_level = $v.length ? ({ "#5eb95e": 1, "#3498db": 2, "#f1c40f": 3 })[$v.attr("fill")] : 0;
                            p.value = $b.html();
                            // Note: 整点 API
                            let j;
                            const f =
                            {
                                exit: () => i = Infinity,
                                away: () => pcr[j] = ef
                            };
                            // Note: 把数据丢给处理器。
                            for (j = 0; j < pcr.length; j++) pcr[j](p, f, reply_params);
                        }
                        else if (!is.empty(pcr)) throw `处理器应该是个数组！别塞奇奇怪怪的 ${typeof pcr} 进来啊！`;
                    }
                    
                    if (!is.empty(cb) && !is.func(cb)) throw `回调是个函数！传你马的 ${typeof cb}！`;
                    cb();
                },
                error: (UCWinb, status, info) =>
                {
                    // Disable: throw `AJAX 出锅了！错误状态是 ${status === "" ? "空的" : status}，错误信息是 ${info === "" ? "空的" : info}，快去修锅啊傻叉！`;
                    LDM.process_page(id, pg, cb, pcr); // Note: 重试
                }
            });
            return;
        },
        process_page: (id, pg, cb, pcr) =>
        {
            let time = new Date().valueOf();
            if (time - LDM.page_cool_down > 0) 
            {
                if (time - LDM.page_cool_down > LDM.delay)
                {
                    LDM._process_page(id, pg, cb, pcr);
                    LDM.page_cool_down = time;
                }
                else 
                {
                    setTimeout(() => LDM._process_page(id, pg, cb, pcr), LDM.delay + LDM.page_cool_down - time);
                    LDM.page_cool_down += LDM.delay;
                }
            }
            else
            {
                setTimeout(() => LDM._process_page(id, pg, cb, pcr), LDM.page_cool_down - time + LDM.delay);
                LDM.page_cool_down += LDM.delay;
            }
        },
        process_discuss: (id, cb = null) =>
        {
            if (!is.num(id)) throw `postid 传错了，应该是数字，憨憨！拿着你的 ${typeof id} 爪巴！`;
            let get_page_num = (p, f) =>
            {
                n = parseInt((data.read_reply_num = parseInt(p.selector.data("reply-count"))) / 10);
                f.away();
            }, pg = data.read_reply_num[id] ? parseInt((data.read_reply_num[id] + 9) / 10) : 1, weight = [], marked_user = [], n = Infinity;
            let f = i => LDM.process_page(id, pg + i, () =>
            {
                if (i <= n) f(i + 1);
                else cb(weight);
            },
            [
                i ? ef : get_page_num,
                p =>
                {
                    let res = [...p.value.matchAll(LDM.mark_matcher)];
                    for (let r of res)
                    {
                        let m = (() =>
                        {
                            for (let i = 2; i < r.length; i++) if (!is.empty(r[i])) return r[i];
                            throw `奇怪的匹配出现了！啥标记都没，你匹配你马呢？`; 
                        })(), [md, mi] = LDM.get_mark_data_by_name(m), ac;
                        if (md.white)
                        {
                            ac = false;
                            for (let j of md.white) if (p.is[j])
                            {
                                ac = true;
                                break;
                            }
                        }
                        else if (md.black)
                        {
                            ac = true;
                            for (let j of md.black) if (p.is[j])
                            {
                                ac = false;
                                break;
                            }
                        }
                        else throw `夭寿啦！${m} 标记的黑白名单都没有啊！快修锅啦！`;
                        if (Math.abs(md.vlv) > p.v_level && (Math.abs(md.vlv) < p.v_level && md.vlv < 0 && !p.is.root)) ac = false; // Note: 某些标记有勾等级要求，还有一些同时放行管理。
                        if (ac && (is.empty(marked_user[mi]) || !marked_user[mi][p.user_id])) // Note: 防止用户多次打上同一标记。
                        {
                            if (is.empty(weight[mi])) weight[mi] = 0;
                            if (is.empty(data.trust[p.user_id])) data.trust[p.user_id] = 10;
                            weight[mi] += data.trust[p.user_id] * (1.3 ** p.v_level) * (p.is.root ? 1.5 : 1) * (p.is.now_root ? 1.5 : 1);
                            if (is.empty(marked_user[mi])) marked_user[mi] = {};
                            marked_user[mi][p.user_id] = true;
                            // Note: 勾与管理（在任更多）有加权。
                        }
                    }
                }
            ]);
            f(0);
        },
        get_time_of_discuss: $i =>
        {
            let s = $i.find("div.am-u-md-6>span.lg-small").text(),
                [, Y, M, D, h, m] = s.match(/@(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})/);
            return [parseInt(Y), parseInt(M), parseInt(D), parseInt(h), parseInt(m)];
        },
        compare_time: (l, r) =>
        {
            for (let i = 0; i < 5; i++) if (l[i] < r[i]) return false;
            else if (l[i] > r[i]) return true;
            return true;
        },
        add_badge: ($r, color, name, HTML) =>
            $r.append(`<span class="am-badge am-radius lg-bg-${color}" name="${name}">${HTML}</span>`),
        rmv_badge: ($r, name) =>
            $r.find(`.am-badge[name=${name}]`).remove()
    };

    // Note: 把 AJAX 拿到的 HTML 整成 DOM 然后塞到 body 后面以便操作。当然，需要隐藏它们。
    $("body").append(`<!-- Zone: LDM Analysing -->
    <style>
    .analysis_element
    {
        display: none;
    }
    .am-u-md-12.mark_result
    {
        margin-top: 5px;
    }
    </style>`);

    // Note: 预处理标记数据。
    let s = "&lt;\\s*(", m, n, f1 = false, f2;
    for (m of LDM.mark_data)
    {
        f1 ? s += "|" : f1 = true;
        s += "(";
        f2 = false;
        for (n of m.name)
        {
            f2 ? s += "|" : f2 = true;
            s += n;
        }
        s += `)[:：]\\s*[\\s\\S]{${m.len},}`;
    }
    s += ")&gt;";
    LDM.mark_matcher = RegExp(s, "g");

    // Note: 定义数据接口。
    let datas = [
        ["read_reply_num", {}],
        ["trust", { 125210: 20 }], // Info: 不要在意，这是作者给自己的小小福利 qwq
        ["test_storage", "init"],
        ["dead_time", [1145, 1, 4, 19, 19]],
        ["global_cool_down", []],
        ["mark_record", []]
    ];
    for (let i of datas) data.def(i[0], i[1]);

    // Debug:
    // if (LDM.debug) LDM.process_discuss(LDM.test_discuss_id, weight => console.log(weight));
    //
    // if (LDM.debug)
    // {
    //     console.log(data.test_storage);
    //     data.test_storage = "edit";
    // }

    // Note: 分析当页所有时限内讨论（时间在 dead_time 后）
    let d = new Date(new Date().valueOf() - 129600000); // Info: 请勿擅自修改此值以免对洛谷（服务器）造成不必要的负担。（两天半前即视为坟贴）
    if (d < 1588152900000) data.dead_time = [2020, 4, 29, 17, 30]; // Note: 脚本发布前的帖子恕不分析。
    else data.dead_time = [d.getYear() + 1900, d.getMonth() + 1, d.getDate(), d.getHours(), d.getMinutes()];
    let $d = $(".lg-content-table-left>.lg-table-row"), $i, time, id,
    f = i =>
    {
        $i = $($d[i]);
        time = LDM.get_time_of_discuss($i);
        if (LDM.compare_time(time, data.dead_time))
        {
            let $r = $(`<div class="am-u-md-12 mark_result"></div>`); // Note: 形成闭包以免 AJAX 回调找错位置
            $i.append($r);
            $r.html("");
            LDM.add_badge($r, "bluelight", "analysing", `分析中 <i class="fas fa-spinner fa-spin"></i>`);
            id = parseInt($i.find(".am-u-md-6>a").attr("href").match(/\d+/)[0]);
            if (is.empty(data.global_cool_down[id]) || new Date().valueOf() - data.global_cool_down[id] > 180000)
                // Info: 请勿擅自修改此值以免对洛谷（服务器）造成不必要的负担。（三分钟才能分析一次）
            {
                data.global_cool_down[id] = new Date().valueOf();
                LDM.process_discuss(id, weight =>
                {
                    $r.html("");
                    data.mark_record[id] = [];
                    for (let j in weight)
                        if (weight[j] >= LDM.mark_data[j].wei)
                        {
                            LDM.add_badge($r, LDM.mark_data[j].color, LDM.mark_data[j].name[0], LDM.mark_data[j].name[1]);
                            data.mark_record[id].push(j);
                        }
                    if (data.mark_record[id].length === 0) LDM.add_badge($r, "bluelight", "nothing", "暂无标记");
                });
            }
            else if (is.array(data.mark_record[id]))
            {
                for (let j of data.mark_record[id])
                    LDM.add_badge($r, LDM.mark_data[j].color, LDM.mark_data[j].name[0], LDM.mark_data[j].name[1]);
                if (data.mark_record[id].length === 0) LDM.add_badge($r, "bluelight", "nothing", "暂无标记");
            }
            else throw `喂，你的分析记录呢？快去找找！要不就是格式错啦！`;
        }
        if (i < $d.length - 1) f(i + 1);
        else console.log("LDM analysed current page of discusses.");
    };
    f(0);
})();