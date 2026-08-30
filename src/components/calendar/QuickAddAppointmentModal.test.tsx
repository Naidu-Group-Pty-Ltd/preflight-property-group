import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { QuickAddAppointmentModal } from './QuickAddAppointmentModal';

vi.mock('@/hooks/useFinanceContacts', () => ({
  useFinanceContacts: () => ({ contacts: [], isLoading: false }),
}));

vi.mock('./TeamOutlookAvailability', () => ({
  TeamOutlookAvailability: () => null,
}));

Object.defineProperty(HTMLElement.prototype, 'hasPointerCapture', { value: () => false });
Object.defineProperty(HTMLElement.prototype, 'setPointerCapture', { value: () => undefined });
Object.defineProperty(HTMLElement.prototype, 'releasePointerCapture', { value: () => undefined });

const calendars = [
  { id: 'calendar-a', name: 'Calendar A', calendarType: 'event', isActive: true },
  { id: 'calendar-b', name: 'Calendar B', calendarType: 'event', isActive: true },
  { id: 'calendar-c', name: 'Calendar C', calendarType: 'event', isActive: true },
];

const renderModal = () => render(
  <QuickAddAppointmentModal
    open
    onOpenChange={vi.fn()}
    calendars={calendars}
    defaultDate={new Date(2026, 6, 24)}
    defaultHour={9}
    isLoading={false}
    onSubmit={vi.fn().mockResolvedValue(true)}
  />,
);

const changeCalendar = async (name: string) => {
  fireEvent.pointerDown(screen.getAllByRole('combobox')[0]);
  fireEvent.click(await screen.findByText(name));
};

describe('QuickAddAppointmentModal', () => {
  it('keeps the complete appointment draft across repeated calendar changes', async () => {
    renderModal();

    fireEvent.click(screen.getByRole('button', { name: 'Zoom Meeting' }));
    fireEvent.change(screen.getByLabelText('Title *'), { target: { value: 'Customer strategy session' } });
    fireEvent.change(screen.getByLabelText('Date *'), { target: { value: '2026-07-30' } });
    fireEvent.change(screen.getByLabelText('Time *'), { target: { value: '14:30' } });
    fireEvent.click(screen.getByRole('button', { name: /45 min/i }));
    fireEvent.change(screen.getByLabelText('Notes'), { target: { value: 'Bring finance documents' } });

    fireEvent.change(screen.getByPlaceholderText('Name'), { target: { value: 'Alex Guest' } });
    fireEvent.change(screen.getByPlaceholderText('Email *'), { target: { value: 'alex@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add invite recipient' }));
    fireEvent.change(screen.getByPlaceholderText('Name'), { target: { value: 'Blair Guest' } });
    fireEvent.change(screen.getByPlaceholderText('Email *'), { target: { value: 'blair@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add invite recipient' }));

    await changeCalendar('Calendar B');
    await changeCalendar('Calendar C');

    expect(screen.getByRole('button', { name: 'Zoom Meeting' })).toHaveClass('bg-primary');
    expect(screen.getByLabelText('Title *')).toHaveValue('Customer strategy session');
    expect(screen.getByLabelText('Date *')).toHaveValue('2026-07-30');
    expect(screen.getByLabelText('Time *')).toHaveValue('14:30');
    expect(screen.getByLabelText('Notes')).toHaveValue('Bring finance documents');
    expect(screen.getByText('Alex Guest')).toBeInTheDocument();
    expect(screen.getByText('Blair Guest')).toBeInTheDocument();
  });

  it('renders accessible date and time picker triggers that open their native controls', () => {
    const showDatePicker = vi.fn();
    const showTimePicker = vi.fn();
    renderModal();

    const dateInput = screen.getByLabelText('Date *') as HTMLInputElement & { showPicker: () => void };
    const timeInput = screen.getByLabelText('Time *') as HTMLInputElement & { showPicker: () => void };
    dateInput.showPicker = showDatePicker;
    timeInput.showPicker = showTimePicker;

    fireEvent.click(screen.getByRole('button', { name: 'Open date picker' }));
    fireEvent.click(screen.getByRole('button', { name: 'Open time picker' }));

    expect(showDatePicker).toHaveBeenCalledOnce();
    expect(showTimePicker).toHaveBeenCalledOnce();
  });
});
