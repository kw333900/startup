import React from 'react';
import './myratings.css';

export function MyRatings() {
  return (
   	<main>
			<table className="table table-striped">
				<thead>
					<tr>
						<th>#</th>
						<th>Name</th>
						<th>Rating</th>
						<th>Date</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td>1</td>
						<td>Inception</td>
						<td>10</td>
						<td>May 20, 2021</td>
					</tr>
					<tr>
						<td>2</td>
						<td>Barbie</td>
						<td>9</td>
						<td>June 2, 2021</td>
					</tr>
					<tr>
						<td>3</td>
						<td>Shane</td>
						<td>8.5</td>
						<td>July 3, 2020</td>
					</tr>
				</tbody>
			</table>
		</main>
  );
}