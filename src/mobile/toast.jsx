import { useEffect } from "react";

const ACTION_LABEL = {
    goToDay: '看課表',
    undo: '復原',
    undoClear: '復原',
};

export default function Toast({ toast, onDismiss, onAction, duration = 4200 }) {
    useEffect(() => {
        if (!toast) return undefined;
        const timer = setTimeout(onDismiss, duration);
        return () => clearTimeout(timer);
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
