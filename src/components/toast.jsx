import { useEffect } from "react";

const ACTION_LABEL = {
    goToDay: '看課表',
    undo: '復原',
    undoClear: '復原',
};

/**
 * 加課、移除、清空之後的回饋。有了「復原」，清空就不需要 window.confirm 了 ——
 * 原生對話框在手機上會打斷操作，而「先做、可復原」是手機上更好的模式。
 */
export default function Toast({ toast, onDismiss, onAction, duration = 4200 }) {
    useEffect(() => {
        if (!toast) return undefined;
        const timer = setTimeout(onDismiss, duration);
        return () => clearTimeout(timer);
        // 用 toast.id 當依賴，換一則提示就重新計時
    }, [toast?.id, duration, onDismiss]);

    if (!toast) return null;

    return (
        <div className="app-toast" role="status">
            <div className="app-toast-text">
                <strong>{toast.title}</strong>
                {toast.meta ? <span className="app-toast-meta">{toast.meta}</span> : null}
            </div>
            {toast.action ? (
                <button
                    type="button"
                    className="app-toast-action"
                    onClick={() => {
                        onAction(toast.action);
                        onDismiss();
                    }}
                >
                    {ACTION_LABEL[toast.action.type] ?? '好'}
                </button>
            ) : null}
        </div>
    );
}
