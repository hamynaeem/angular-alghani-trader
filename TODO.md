# Work Items

- [x] Fix customer Balance resetting to 0 after refresh
  - [x] Modify `CustomersComponent` so it does NOT silently run `recalcbalances` on every `ngOnInit`
- [x] Keep explicit recalculation available via existing `SyncBalances` method/dialog (if used elsewhere)
  - [ ] Verify build/tests compile



