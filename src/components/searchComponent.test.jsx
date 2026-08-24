import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchComponent from './searchComponent';
import { renderWithStore } from '../testUtils/render';
import { MOBILE_WIDTH, DESKTOP_WIDTH } from '../testUtils/viewport';

function renderSearch({ keyword = '', hideConflicted = false, width = MOBILE_WIDTH } = {}) {
    window.innerWidth = width;
    const setDisplaySettings = vi.fn();
    renderWithStore(
        <SearchComponent
            displaySettings={{ keyword, isShowedConflictedCourses: !hideConflicted }}
            setDisplaySettings={setDisplaySettings}
        />
    );
    return { setDisplaySettings };
}

beforeEach(() => {
    localStorage.clear();
});

afterEach(() => {
    window.innerWidth = DESKTOP_WIDTH;
});

test('搜尋框可以輸入關鍵字', async () => {
    const { setDisplaySettings } = renderSearch();
    await userEvent.type(screen.getByPlaceholderText(/課名/), '演算法');
    expect(setDisplaySettings).toHaveBeenCalled();
});

test('搜尋框字級至少 16px，避免 iOS 聚焦時自動放大', () => {
    renderSearch();
    expect(screen.getByPlaceholderText(/課名/)).toHaveClass('search-bar');
});

test('手機把篩選收在底部 sheet 裡，預設不顯示欄位', () => {
    renderSearch({ width: MOBILE_WIDTH });
    expect(screen.queryByLabelText('上課系所')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^篩選/ })).toBeInTheDocument();
});

test('手機點篩選會打開 sheet，裡面是原生 select', async () => {
    renderSearch({ width: MOBILE_WIDTH });
    await userEvent.click(screen.getByRole('button', { name: /^篩選/ }));

    const department = await screen.findByLabelText('上課系所');
    expect(department.tagName).toBe('SELECT');
    expect(screen.getByLabelText('校區').tagName).toBe('SELECT');
    expect(screen.getByLabelText('課程類別').tagName).toBe('SELECT');
});

test('桌機直接把 select 排在頁面上，沒有 sheet 按鈕', () => {
    renderSearch({ width: DESKTOP_WIDTH });
    expect(screen.getByLabelText('上課系所').tagName).toBe('SELECT');
    expect(screen.queryByRole('button', { name: /^篩選/ })).not.toBeInTheDocument();
});

test('系所選單載入全部系所，交給系統選擇器處理', () => {
    renderSearch({ width: DESKTOP_WIDTH });
    const options = within(screen.getByLabelText('上課系所')).getAllByRole('option');
    expect(options.length).toBeGreaterThan(100);
    expect(options[0]).toHaveTextContent('不限');
    expect(options.map(o => o.textContent)).toContain('資工系');
});

test('生效中的篩選條件顯示成可移除的 chip', () => {
    renderSearch();
    // INITIAL_FILTERS 預設是蘭潭校區 + 大學部
    expect(screen.getByRole('button', { name: '移除篩選 校區：蘭潭校區' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '移除篩選 上課學制：大學部' })).toBeInTheDocument();
});

test('「不限」的條件不會產生 chip', () => {
    renderSearch();
    expect(screen.queryByRole('button', { name: /上課系所/ })).not.toBeInTheDocument();
});

test('點 chip 的移除會把該條件清成「不限」', async () => {
    renderSearch({ width: DESKTOP_WIDTH });
    await userEvent.click(screen.getByRole('button', { name: '移除篩選 校區：蘭潭校區' }));

    expect(screen.queryByRole('button', { name: /移除篩選 校區/ })).not.toBeInTheDocument();
    expect(screen.getByLabelText('校區')).toHaveValue('不限');
});

test('改 select 會更新條件並反映在 chip 上', async () => {
    renderSearch({ width: DESKTOP_WIDTH });
    await userEvent.selectOptions(screen.getByLabelText('上課系所'), '資工系');

    expect(screen.getByRole('button', { name: '移除篩選 上課系所：資工系' })).toBeInTheDocument();
});

test('可以一次把所有條件清成不限', async () => {
    renderSearch({ width: DESKTOP_WIDTH });
    await userEvent.click(screen.getByRole('button', { name: /清除全部條件/ }));

    expect(screen.queryByRole('button', { name: /移除篩選/ })).not.toBeInTheDocument();
});

test('隱藏衝堂的開關會回報上去', async () => {
    const { setDisplaySettings } = renderSearch({ width: DESKTOP_WIDTH });
    await userEvent.click(screen.getByLabelText('隱藏衝堂的課'));
    expect(setDisplaySettings).toHaveBeenCalled();
});

test('節次選單用學校的代碼順序', () => {
    renderSearch({ width: DESKTOP_WIDTH });
    const options = within(screen.getByLabelText('開始節次')).getAllByRole('option');
    expect(options.map(o => o.textContent)).toEqual(
        ['不限', '1', '2', '3', '4', 'F', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D']
    );
});
