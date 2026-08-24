import { beforeEach, expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useIsMobile } from './useIsMobile';
import { setViewportWidth, DESKTOP_WIDTH, MOBILE_WIDTH } from '../testUtils/viewport';

function Probe() {
    const isMobile = useIsMobile();
    return <span data-testid="probe">{isMobile ? 'mobile' : 'desktop'}</span>;
}

beforeEach(() => {
    window.innerWidth = DESKTOP_WIDTH;
});

test('手機寬度回傳 true', () => {
    window.innerWidth = MOBILE_WIDTH;
    render(<Probe />);
    expect(screen.getByTestId('probe')).toHaveTextContent('mobile');
});

test('Bootstrap lg 斷點以上回傳 false', () => {
    window.innerWidth = 992;
    render(<Probe />);
    expect(screen.getByTestId('probe')).toHaveTextContent('desktop');
});

test('平板直向（991px）仍算手機版面', () => {
    window.innerWidth = 991;
    render(<Probe />);
    expect(screen.getByTestId('probe')).toHaveTextContent('mobile');
});

test('視窗寬度改變時會跟著更新', () => {
    render(<Probe />);
    expect(screen.getByTestId('probe')).toHaveTextContent('desktop');

    setViewportWidth(MOBILE_WIDTH);
    expect(screen.getByTestId('probe')).toHaveTextContent('mobile');

    setViewportWidth(DESKTOP_WIDTH);
    expect(screen.getByTestId('probe')).toHaveTextContent('desktop');
});
