import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GlobalDataProvider } from '../hooks/useGlobalData';

export function seedSelectedCourses(courses) {
    localStorage.setItem('userSelectedCourses', JSON.stringify(courses));
}

export function renderWithStore(ui, { courses, queryClient } = {}) {
    if (courses) seedSelectedCourses(courses);
    const client = queryClient ?? new QueryClient({
        defaultOptions: { queries: { retry: false } },
    });
    return render(
        <QueryClientProvider client={client}>
            <GlobalDataProvider>{ui}</GlobalDataProvider>
        </QueryClientProvider>
    );
}
