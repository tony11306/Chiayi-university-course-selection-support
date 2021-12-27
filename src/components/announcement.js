function Announcement() {
    return (
        <div className="alert alert-success" role="alert">
            <h4 className="alert-heading">📢小公告</h4>
            <p>【Bug】目前 ios 手機用戶點擊輸出課表的按鈕會無法正確輸出，請暫時使用電腦。原因似乎和 ios 的檔案系統和瀏覽器 bug 有關。</p>
            <p>【新增】現在 Local storage 會儲存使用數據，也就是說瀏覽器會暫存你的選課結果</p>
            <p>【提醒】盡量善用篩選器，不然畫面元素過多會造成卡頓。</p>
            <p>【提醒】點擊課程清單右上角的「查看已選課程」可以移除選擇的課程。</p>
            <hr />
            <p className="mb-0">如果有什麼問題，歡迎直接寄信到 <a href='mailto:tony20020507@gmail.com'>tony11306 的信箱</a></p>
            <p className='mb-0'>或者可以到我的巴哈姆特小屋文章留言 <a href='https://home.gamer.com.tw/artwork.php?sn=5342422'>【程式作品】嘉義大學選課輔助器</a></p>
        </div>
    )
}

export default Announcement