import * as React from 'react';
// import { DataGrid } from '@mui/x-data-grid';
import { DataGrid } from '@material-ui/data-grid';

const columns = [
  // { field: 'id', headerName: 'ID', width: 70 },
  { field: 'id', headerName: 'ID', width: 70 },
  { field: 'snippet', headerName: 'text', width: 300 },
  { field: 'source', headerName: 'document title', width: 300 },
  { field: 'manual_label', headerName: 'manual label', width: 130 },
  { field: 'predicted_label', headerName: 'predicted label', width: 130 },
  // { field: 'prediction_score', headerName: 'prediction_score', width: 130 },
  { field: 'uncertainty_score', headerName: 'uncertainty score', width: 130 },
//   { field: 'topic_id', headerName: 'topic_id', width: 130 },

//   {
//     field: 'age',
//     headerName: 'Age',
//     type: 'number',
//     width: 90,
//   },
//   {
//     field: 'fullName',
//     headerName: 'Full name',
//     description: 'This column has a value getter and is not sortable.',
//     sortable: false,
//     width: 160,
//     valueGetter: (params) =>
//       `${params.getValue(params.id, 'firstName') || ''} ${
//         params.getValue(params.id, 'lastName') || ''
//       }`,
//   },
];


    //     const document_list = <TableContainer component={Paper}>
    //     <Table sx={{ minWidth: 650 }} aria-label="simple table">
    //       <TableHead>
    //         <TableRow>
    //             <TableCell>Topic</TableCell>
    //           <TableCell>Text</TableCell>
    //           <TableCell>Manual label</TableCell>
    //           <TableCell>Predicted label</TableCell>
    //           <TableCell>Prediction score</TableCell>

    //         </TableRow>
    //       </TableHead>
    //       <TableBody>
    //         {this.state.documents.map((row, index) =>
    //             <TableRow
    //             key={index}
    //             sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
    //           >
    //             <TableCell component="th" scope="row">
    //               {row['topic_words']}
    //             </TableCell>
    //             {/* <TableCell align="right">
    //                 {row.calories}
    //             </TableCell> */}

    //           </TableRow>
    //         )}

    //       </TableBody>
    //     </Table>
    //   </TableContainer>

// const rows = [
//   { id: 1, lastName: 'Snow', firstName: 'Jon', age: 35 },
//   { id: 2, lastName: 'Lannister', firstName: 'Cersei', age: 42 },
//   { id: 3, lastName: 'Lannister', firstName: 'Jaime', age: 45 },
//   { id: 4, lastName: 'Stark', firstName: 'Arya', age: 16 },
//   { id: 5, lastName: 'Targaryen', firstName: 'Daenerys', age: null },
//   { id: 6, lastName: 'Melisandre', firstName: null, age: 150 },
//   { id: 7, lastName: 'Clifford', firstName: 'Ferrara', age: 44 },
//   { id: 8, lastName: 'Frances', firstName: 'Rossini', age: 36 },
//   { id: 9, lastName: 'Roxie', firstName: 'Harvey', age: 65 },
// ];


export default function DocumentList(props) {

  // const rows = props.documents.map((row) => {})
  const rows = props.documents;

  return (
    <div style={{ height: 1200, width: '100%' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        pageSize={20}
        rowsPerPageOptions={[20]}
        checkboxSelection
      />
    </div>
  );
}