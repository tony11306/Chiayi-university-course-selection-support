import { useIsMobile } from "../hooks/useIsMobile";

export default function Announcement() {
    const isMobile = useIsMobile();

    return (
        <section className="announcement">
            <h2 className="h5">小公告</h2>
            <p>
                {isMobile
                    ? '【提醒】底部的「已選」分頁可以查看或移除選擇的課程；在「找課」輕觸課程卡，上方的課表縮圖會先標出它會落在哪一節。'
                    : '【提醒】點擊螢幕右下角的書籤按鈕，可以查看或移除選擇的課程。'}
            </p>
            <hr />
            <p className="mb-0">
                如果有什麼問題，歡迎直接寄信到 <a href="mailto:tony20020507@gmail.com">tony11306 的信箱</a>
            </p>
            <p className="mb-0">
                或者可以到我的巴哈姆特小屋文章留言{' '}
                <a href="https://home.gamer.com.tw/artwork.php?sn=5342422" target="_blank" rel="noreferrer">
                    【程式作品】嘉義大學選課輔助器
                </a>
            </p>
        </section>
    );
}
