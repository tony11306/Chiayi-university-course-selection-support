import { useState } from "react";
import Modal from "react-bootstrap/Modal";
import { useGlobalData } from "../hooks/useGlobalData";
import { useIsMobile } from "../hooks/useIsMobile";
import SelectedCoursesList from "./selectedCoursesList";

const BookmarkIcon = ({ size = 24 }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
        <path d="M7.84 4.1a.178.178 0 0 1 .32 0l.634 1.285a.178.178 0 0 0 .134.098l1.42.206c.145.021.204.2.098.303L9.42 6.993a.178.178 0 0 0-.051.158l.242 1.414a.178.178 0 0 1-.258.187l-1.27-.668a.178.178 0 0 0-.165 0l-1.27.668a.178.178 0 0 1-.257-.187l.242-1.414a.178.178 0 0 0-.05-.158l-1.03-1.001a.178.178 0 0 1 .098-.303l1.42-.206a.178.178 0 0 0 .134-.098L7.84 4.1z" />
        <path d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v13.5a.5.5 0 0 1-.777.416L8 13.101l-5.223 2.815A.5.5 0 0 1 2 15.5V2zm2-1a1 1 0 0 0-1 1v12.566l4.723-2.482a.5.5 0 0 1 .554 0L13 14.566V2a1 1 0 0 0-1-1H4z" />
    </svg>
);

/**
 * 桌機才需要這顆書籤按鈕：手機版已選課程是自己的分頁，
 * 而這顆按鈕原本靠 :hover 從螢幕外滑出來，在手機上永遠是被切掉的狀態。
 */
export default function SelectedCoursesPanel() {
    const { userSelectedCourses } = useGlobalData();
    const [isModalShown, setIsModalShown] = useState(false);
    const isMobile = useIsMobile();

    if (isMobile) return null;

    return (
        <>
            <button
                type="button"
                className="btn edit-btn blur-background shadow-none"
                aria-label={`已選擇的課程（${userSelectedCourses.length} 門）`}
                onClick={() => setIsModalShown(true)}
            >
                <span className="cnt-div">{userSelectedCourses.length}</span>
                <BookmarkIcon />
            </button>

            <Modal
                show={isModalShown}
                onHide={() => setIsModalShown(false)}
                size="lg"
                centered
                animation={false}
                contentClassName="border-0 rounded"
            >
                <Modal.Header closeButton>
                    <BookmarkIcon />
                    <Modal.Title as="h2" className="h6 fw-bold m-1">已選擇的課程</Modal.Title>
                </Modal.Header>
                <Modal.Body className="selected-courses-body">
                    <SelectedCoursesList />
                </Modal.Body>
            </Modal>
        </>
    );
}
