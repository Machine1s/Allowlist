import { render, screen, fireEvent, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from './App';

// Setup Mocks
beforeEach(() => {
    Object.defineProperty(globalThis, 'crypto', {
        value: {
            randomUUID: () => 'uuid-' + Math.random().toString(36).substring(2, 9)
        }
    });

    // Mock window.scroll methods usually called by modals
    window.scrollTo = vi.fn();
});

describe('User Journey: Advanced Operations', () => {
    it('handles Create, Delete, Duplicate and Bulk Operations', async () => {
        // [Act 1] Setup: Create two policies "Policy A" and "Policy B"
        render(<App />);

        const addPolicy = () => {
            fireEvent.click(screen.getByText('Add Policy'));
        };

        const typeName = (rowIndex: number, name: string) => {
            const rows = screen.getAllByRole('row');
            // index + 1 because row 0 is header
            const row = rows[rowIndex + 1];
            const input = within(row).getByPlaceholderText('PolicyName(NoSpaces)');
            fireEvent.change(input, { target: { value: name } });
        };

        // Create Policy A
        addPolicy();
        typeName(0, 'PolicyA');

        // Create Policy B
        addPolicy();
        // Note: New policy is added to the TOP (unshift)
        // So Policy B is at index 0, Policy A is at index 1
        typeName(0, 'PolicyB');

        // Verify we have PolicyA and PolicyB
        expect(screen.getByDisplayValue('PolicyA')).toBeInTheDocument();
        expect(screen.getByDisplayValue('PolicyB')).toBeInTheDocument();

        // [Act 2] Single Delete: Delete "PolicyB" (the top one)
        // Find the delete button for the first row. 
        // The header has a checkbox but no delete button.
        // Each row has a checkbox and a delete button at the end.
        const rows = screen.getAllByRole('row');
        const rowB = rows[1]; // Header is 0

        // Find the Trash icon button in this row. 
        // We can query by role 'button' inside the LAST cell.
        const cells = within(rowB).getAllByRole('cell');
        const deleteBtn = within(cells[cells.length - 1]).getByRole('button');

        fireEvent.click(deleteBtn);

        // Verify PolicyB is gone, PolicyA remains
        expect(screen.queryByDisplayValue('PolicyB')).not.toBeInTheDocument();
        expect(screen.getByDisplayValue('PolicyA')).toBeInTheDocument();

        // [Act 3] Single Duplicate: Copy "PolicyA"
        // First, we must SELECT it.
        const rowA = screen.getAllByRole('row')[1]; // Now PolicyA is at top
        const checkboxA = within(rowA).getByRole('checkbox');
        fireEvent.click(checkboxA);

        // Find the Duplicate button in the Header/Toolbar
        // It appears only when selection > 0
        const dupBtn = screen.getByText('Duplicate'); // Button contains text "Duplicate"
        fireEvent.click(dupBtn);

        // Expect: "PolicyA_copy" to appear.
        // It's added to the end of list usually (Appended).
        expect(screen.getByDisplayValue('PolicyA_copy')).toBeInTheDocument();

        // [Act 4] Bulk Duplicate: Select Both "PolicyA" and "PolicyA_copy"
        // Current state: PolicyA (selected), PolicyA_copy (not selected).
        // Let's select PolicyA_copy too.
        // Find the input with value 'PolicyA_copy' to locate the row
        const inputCopy = screen.getByDisplayValue('PolicyA_copy');
        const rowCopy = inputCopy.closest('tr')!;
        const checkboxCopy = within(rowCopy).getByRole('checkbox');
        fireEvent.click(checkboxCopy);

        // Now both are selected. Click Duplicate again.
        fireEvent.click(dupBtn);

        // Expect: 4 items total.
        // PolicyA, PolicyA_copy, PolicyA_copy (from A), PolicyA_copy_copy (from A_copy)
        // Actually the logic appends "_copy" to the description.
        // So we expect:
        // 1. PolicyA_copy (duplicate of A)
        // 2. PolicyA_copy_copy (duplicate of A_copy)
        // Note: duplicate logic appends to the end of list.

        // Verify we have 4 rows (plus header = 5 trs)
        expect(screen.getAllByRole('row').length).toBe(5);
        expect(screen.getByDisplayValue('PolicyA_copy_copy')).toBeInTheDocument();

        // [Act 5] Bulk Delete: Delete 3 items
        // Let's select the first 3 checkboxes.
        // Currently selected: PolicyA, PolicyA_copy.
        // The new duplicates are NOT auto-selected.
        // Let's select one of the new ones.
        const allCheckboxes = screen.getAllByRole('checkbox');
        // Index 0 is "Select All" in header.
        // Indices 1, 2, 3, 4 are rows.
        // We want to delete 3 rows.
        // Ensure 1, 2, 3 are checked.
        // Check 1 (PolicyA) is already checked.
        // Check 2 (PolicyA_copy) is already checked.
        // Check 3 (New one): Click it.
        fireEvent.click(allCheckboxes[3]);

        // Now we have 3 selected.
        const bulkDeleteBtn = screen.getByText(/Delete \(3\)/); // Button text updates dynamically
        expect(bulkDeleteBtn).toBeInTheDocument();

        fireEvent.click(bulkDeleteBtn);

        // Expect: Only 1 row remains (plus header = 2 trs)
        expect(screen.getAllByRole('row').length).toBe(2);

        // And "Select All" checkbox should be unchecked (implied by logic, but good to check state if needed)
    });
});
