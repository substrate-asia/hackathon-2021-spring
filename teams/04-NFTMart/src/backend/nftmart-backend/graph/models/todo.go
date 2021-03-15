package models

import "time"

// table name
func (t *Todo) TableName() string {
	return "tb_todo"
}

type Todo struct {
	ID         int    `json:",pk,unique,notnull"`
	Name       string `json:"name"`
	IsComplete bool   `json:"isComplete"`
	IsDeleted  bool   `json:"isDeleted"`

	CreatedBy int `json:"createdBy" pg:"fk:user_id"`
	UpdatedBy int `json:"updatedBy" pg:"fk:user_id"`

	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

type TodoInput struct {
	Name      string `json:"name"`
	CreatedBy int    `json:"user"`
}
