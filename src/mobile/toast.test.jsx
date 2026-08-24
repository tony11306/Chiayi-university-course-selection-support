import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Toast from './toast';

beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
});

afterEach(() => {
    vi.useRealTimers();
});

test('沒有提示時不渲染', () => {
    const { container } = render(<Toast toast={null} onDismiss={() => {}} onAction={() => {}} />);
    expect(container).toBeEmptyDOMElement();
});

test('顯示標題與補充說明', () => {
    render(
        <Toast
            toast={{ id: 1, title: '已加入 資料結構', meta: '一 2~4' }}
            onDismiss={() => {}}
            onAction={() => {}}
        />
    );
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('已加入 資料結構')).toBeInTheDocument();
    expect(screen.getByText('一 2~4')).toBeInTheDocument();
});

test('goToDay 的動作叫做「看課表」，點了會回呼並關掉提示', async () => {
    const onAction = vi.fn();
    const onDismiss = vi.fn();
    const action = { type: 'goToDay', day: '一' };
    render(
        <Toast toast={{ id: 1, title: '已加入 資料結構', action }} onDismiss={onDismiss} onAction={onAction} />
    );

    await userEvent.click(screen.getByRole('button', { name: '看課表' }));
    expect(onAction).toHaveBeenCalledWith(action);
    expect(onDismiss).toHaveBeenCalled();
});

test('undo 的動作叫做「復原」', () => {
    render(
        <Toast
            toast={{ id: 1, title: '已移除 資料結構', action: { type: 'undo' } }}
            onDismiss={() => {}}
            onAction={() => {}}
        />
    );
    expect(screen.getByRole('button', { name: '復原' })).toBeInTheDocument();
});

test('沒有動作時只有文字', () => {
    render(<Toast toast={{ id: 1, title: '已下載 選課結果.png' }} onDismiss={() => {}} onAction={() => {}} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
});

test('過了時間會自動關掉', () => {
    const onDismiss = vi.fn();
    render(<Toast toast={{ id: 1, title: '已加入 資料結構' }} onDismiss={onDismiss} onAction={() => {}} duration={4000} />);

    expect(onDismiss).not.toHaveBeenCalled();
    act(() => { vi.advanceTimersByTime(4000); });
    expect(onDismiss).toHaveBeenCalledTimes(1);
});

test('換一則提示會重新計時，不會被上一則的計時器提早關掉', () => {
    const onDismiss = vi.fn();
    const { rerender } = render(
        <Toast toast={{ id: 1, title: '第一則' }} onDismiss={onDismiss} onAction={() => {}} duration={4000} />
    );

    act(() => { vi.advanceTimersByTime(3000); });
    rerender(
        <Toast toast={{ id: 2, title: '第二則' }} onDismiss={onDismiss} onAction={() => {}} duration={4000} />
    );

    act(() => { vi.advanceTimersByTime(1500); });
    expect(onDismiss).not.toHaveBeenCalled();

    act(() => { vi.advanceTimersByTime(2500); });
    expect(onDismiss).toHaveBeenCalledTimes(1);
});
