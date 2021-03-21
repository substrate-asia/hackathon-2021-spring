package services

import (
	"assets-api/models"

	"github.com/beego/beego/v2/client/orm"
)

type CommonService struct {
	BaseService
}

//查询存证
func (this *CommonService) QueryProof(proofNo string) (*models.ResQueryProof, error) {
	ormer := orm.NewOrm()
	resQueryProof := models.ResQueryProof{}
	err := ormer.Raw("select p.tx_hash,p.proof_book from "+new(models.Proof).TableName()+" p where p.proof_no = ? or p.tx_hash = ?", proofNo, proofNo).QueryRow(&resQueryProof)
	//err := ormer.QueryTable(new(models.Proof).TableName()).Filter("ProofNo", proofNo).One(&proof, "ProofBook")
	if err != nil {
		return &models.ResQueryProof{}, err
	}
	return &resQueryProof, nil
}
