import { createSlice } from '@reduxjs/toolkit';

const tableSlice = createSlice({
  name: 'table',
  initialState: { tableId: null },
  reducers: {
    setTableId: (state, action) => {
      state.tableId = action.payload;
    },
  },
});

export const { setTableId } = tableSlice.actions;
export default tableSlice.reducer;
