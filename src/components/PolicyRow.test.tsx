import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PolicyRow } from './PolicyRow';
import type { Policy } from '../lib/types';

describe('PolicyRow Component', () => {
    const mockPolicy: Policy = {
        id: '1',
        description: 'TestPolicy',
        protocol: 'tcp',
        ipObjects: ['1.1.1.1'],
        portObjects: ['80'],
        isValid: true,
        validationErrors: []
    };

    const mockUpdate = vi.fn();
    const mockDelete = vi.fn();
    const mockToggle = vi.fn();

    it('renders policy information correctly', () => {
        render(
            <table>
                <tbody>
                    <PolicyRow
                        policy={mockPolicy}
                        onUpdate={mockUpdate}
                        onDelete={mockDelete}
                        isChecked={false}
                        onToggleCheck={mockToggle}
                    />
                </tbody>
            </table>
        );

        expect(screen.getByDisplayValue('TestPolicy')).toBeInTheDocument();
        // Check if IP is displayed in the button text
        expect(screen.getByText('1.1.1.1')).toBeInTheDocument();
        // Check if Port is displayed in the button text
        expect(screen.getByText('80')).toBeInTheDocument();
    });

    it('opens IP modal when IP button is clicked', () => {
        render(
            <table>
                <tbody>
                    <PolicyRow
                        policy={mockPolicy}
                        onUpdate={mockUpdate}
                        onDelete={mockDelete}
                        isChecked={false}
                        onToggleCheck={mockToggle}
                    />
                </tbody>
            </table>
        );

        // Find the button that contains the IP text
        // Note: We use queryByText or closest('button') to be safe
        const ipText = screen.getByText('1.1.1.1');
        const ipButton = ipText.closest('button');

        expect(ipButton).toBeInTheDocument();

        // Click it
        fireEvent.click(ipButton!);

        // Check if modal title appears
        // The modal is rendered via Portal or inline? 
        // In our code it is inline inside PolicyRow (impl detail)
        expect(screen.getByText('Manage IPs for: TestPolicy')).toBeInTheDocument();
    });
});
