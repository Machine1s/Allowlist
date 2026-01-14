import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { IpPartInput } from './IpPartInput';

describe('IpPartInput', () => {
    it('renders 4 input fields', () => {
        render(<IpPartInput value="0.0.0.0" onChange={() => { }} />);
        const inputs = screen.getAllByRole('textbox');
        expect(inputs).toHaveLength(4);
    });

    it('initializes from value', () => {
        render(<IpPartInput value="192.168.1.1" onChange={() => { }} />);
        const inputs = screen.getAllByRole('textbox') as HTMLInputElement[];
        expect(inputs[0].value).toBe('192');
        expect(inputs[1].value).toBe('168');
        expect(inputs[2].value).toBe('1');
        expect(inputs[3].value).toBe('1');
    });

    it('initializes from defaultValue if value is empty', () => {
        const handleChange = vi.fn();
        render(<IpPartInput value="" onChange={handleChange} defaultValue="10.0.0.0" />);
        // Should trigger onChange immediately to sync default
        expect(handleChange).toHaveBeenCalledWith("10.0.0.0");

        const inputs = screen.getAllByRole('textbox') as HTMLInputElement[];
        expect(inputs[0].value).toBe('10');
    });

    it('validates input (0-255)', () => {
        const handleChange = vi.fn();
        render(<IpPartInput value="0.0.0.0" onChange={handleChange} />);
        const inputs = screen.getAllByRole('textbox');

        // Try entering 300
        fireEvent.change(inputs[0], { target: { value: '300' } });
        expect(handleChange).not.toHaveBeenCalled(); // Should block

        // Enter valid
        fireEvent.change(inputs[0], { target: { value: '100' } });
        expect(handleChange).toHaveBeenCalledWith('100.0.0.0');
    });
});
