import React from "react";
import { Table, Form } from "semantic-ui-react";

const ConfirmOrder = (props) => (
  <Table definition>
    <Table.Body>
      <Table.Row>
        <Table.Cell>PERSONAL DETAILS</Table.Cell>
        <Table.Cell>
          <Form.Field
            required
            type="text"
            control="input"
            placeholder="Receiver Name"
            onChange={(event) =>
              props.handleInput("receiver", event.target.value)
            }
            disabled={!props.loading}
          />
        </Table.Cell>
      </Table.Row>
      <Table.Row>
        <Table.Cell>Mobile</Table.Cell>
        <Table.Cell>
          <Form.Field
            required
            type="text"
            control="input"
            placeholder="Mobile"
            onChange={(event) =>
              props.handleInput("mobile", event.target.value)
            }
            disabled={!props.loading}
          />
        </Table.Cell>
      </Table.Row>
      <Table.Row>
        <Table.Cell>HOME ADDRESS</Table.Cell>
        <Table.Cell>
          <Form.Field
            required
            type="text"
            control="input"
            placeholder="Home Address"
            onChange={(event) =>
              props.handleInput("address", event.target.value)
            }
            disabled={!props.loading}
          />
        </Table.Cell>
      </Table.Row>
      <Table.Row>
        <Table.Cell>REWARD</Table.Cell>
        <Table.Cell>
          <Form.Field
            type="number"
            control="input"
            placeholder="$0.00"
            onChange={(event) =>
              props.handleInput("reward", event.target.value)
            }
            disabled={!props.loading}
          />
        </Table.Cell>
      </Table.Row>
    </Table.Body>
  </Table>
);

export default ConfirmOrder;
