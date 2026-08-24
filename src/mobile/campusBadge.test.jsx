import { expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import CampusBadge from './campusBadge';

test('顯示校區名稱', () => {
    render(<CampusBadge campus="蘭潭校區" />);
    expect(screen.getByText('蘭潭校區')).toBeInTheDocument();
});

test('每個校區有自己的識別色', () => {
    const campuses = ['蘭潭校區', '民雄校區', '新民校區', '林森校區', 'ecourse 線上'];
    const variants = campuses.map(campus => {
        const { container, unmount } = render(<CampusBadge campus={campus} />);
        const variant = container.firstChild.getAttribute('data-campus');
        unmount();
        return variant;
    });
    expect(new Set(variants).size).toBe(campuses.length);
    expect(variants.every(Boolean)).toBe(true);
});

test('沒見過的校區也不會壞掉', () => {
    render(<CampusBadge campus="太空校區" />);
    expect(screen.getByText('太空校區')).toBeInTheDocument();
});

test('沒有校區時不渲染', () => {
    const { container } = render(<CampusBadge campus="" />);
    expect(container).toBeEmptyDOMElement();
});
