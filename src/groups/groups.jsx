import React from 'react';
import './groups.css';

export function Groups() {
  return (
    <main>

          
      <ul className="notification">
        <li className="player-name">Joe rated a new movie</li>
        <li className="player-name">Jill rated a new movie</li>
        <li className="player-name">Tim rated a new movie</li>
      </ul> 




			<table className="table table-striped">
				<thead>
					<tr>
						<th>Group</th>
						<th># of Members</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td>MyFam</td>
						<td>5</td>
					</tr>
					<tr>
						<td>MyFriends</td>
						<td>9</td>
					</tr>
				</tbody>
			</table>
		</main>
  );
}