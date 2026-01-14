import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PolicyTable } from './PolicyTable'; // Component to test
import type { Policy } from '../lib/types';

describe('PolicyTable Global Validation', () => {
    // Mock helper to create simple policies
    const createPolicy = (id: string, name: string, ips: string[]): Policy => ({
        id,
        description: name,
        protocol: 'tcp',
        ipObjects: ips,
        portObjects: [],
        isValid: true,
        validationErrors: []
    });

    const mockSetPolicies = vi.fn();
    const mockSetSelected = vi.fn();

    it('shows no errors for unique IPs', () => {
        const policies = [
            createPolicy('1', 'Policy A', ['1.1.1.1']),
            createPolicy('2', 'Policy B', ['2.2.2.2'])
        ];

        render(
            <PolicyTable
                policies={policies}
                setPolicies={mockSetPolicies}
                selectedIds={[]}
                setSelectedIds={mockSetSelected}
            />
        );

        // Expect NO "Duplicate IP" text
        const duplicateWarning = screen.queryByText(/Duplicate IP/);
        expect(duplicateWarning).not.toBeInTheDocument();
    });

    it('detects duplicate IPs between two policies', () => {
        const policies = [
            createPolicy('1', 'Policy A', ['10.0.0.1']),
            createPolicy('2', 'Policy B', ['10.0.0.1']) // Duplicate!
        ];

        render(
            <PolicyTable
                policies={policies}
                setPolicies={mockSetPolicies}
                selectedIds={[]}
                setSelectedIds={mockSetSelected}
            />
        );

        // 1. Check if specific error message exists in the document (even if hidden in tooltip)
        // Expected message: Duplicate IP '10.0.0.1' found in: Policy B
        expect(screen.getByText(/Duplicate IP '10.0.0.1' found in: Policy B/)).toBeInTheDocument();
        expect(screen.getByText(/Duplicate IP '10.0.0.1' found in: Policy A/)).toBeInTheDocument();
    });

    it('performs bulk delete correctly', () => {
        const policies = [
            createPolicy('1', 'Policy A', []),
            createPolicy('2', 'Policy B', [])
        ];

        render(
            <PolicyTable
                policies={policies}
                setPolicies={mockSetPolicies}
                selectedIds={['1']} // Simulate Policy 1 is selected
                setSelectedIds={mockSetSelected}
            />
        );

        // Find the Delete button (it shows "Delete (1)")
        // The button has text "Delete (1)"
        const deleteButton = screen.getByText(/Delete \(1\)/).closest('button');
        expect(deleteButton).toBeInTheDocument();

        // Simulate User Click
        const confirmSpy = vi.spyOn(window, 'confirm').mockImplementation(() => true);

        fireEvent.click(deleteButton!);

        // Expect setPolicies to be called with ONLY Policy 2 (Policy 1 removed)
        // The argument should be an array containing ONLY object with id='2'
        expect(mockSetPolicies).toHaveBeenCalledWith([
            expect.objectContaining({ id: '2' })
        ]);

        // Expect selectedIds to be cleared
        expect(mockSetSelected).toHaveBeenCalledWith([]);

        confirmSpy.mockRestore();
    });

    it('updates selection when checkboxes are clicked', () => {
        const policies = [createPolicy('1', 'Policy A', [])];

        render(
            <PolicyTable
                policies={policies}
                setPolicies={mockSetPolicies}
                selectedIds={[]} // Initially empty
                setSelectedIds={mockSetSelected}
            />
        );

        // Find checkbox for row 1
        const checkbox = screen.getAllByRole('checkbox')[1]; // [0] is select-all
        fireEvent.click(checkbox);

        // Expect setSelectedIds to be called with ['1']
        expect(mockSetSelected).toHaveBeenCalledWith(['1']);
    });
});
