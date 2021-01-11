
// AttributeInstance* getMutableInstance(AttributeId type) noexcept;

import { RawTypeId } from "bdsx/common";
import { makefunc, VoidPointer } from "bdsx/core";
import { NativeClass } from "bdsx/nativeclass";
import { float32_t } from "bdsx/nativetype";
import { proc } from "./proc";

export enum AttributeId
{
	ZombieSpawnReinforcementsChange=1,
	PlayerHunger=2,
	PlayerSaturation=3,
	PlayerExhaustion=4,
	PlayerLevel=5,
	PlayerExperience=6,
	Health=7,
	FollowRange=8,
	KnockbackResistance=9,
	MovementSpeed=10,
	UnderwaterMovementSpeed=11,
	AttackDamage=12,
	Absorption=13,
	Luck=14,
	JumpStrength=15, // for horse?
};

export class AttributeInstance extends NativeClass
{
	vftable:VoidPointer;
	u1:VoidPointer;
	u2:VoidPointer;
	currentValue:float32_t;
	minValue:float32_t;
	maxValue:float32_t;
	defaultValue:float32_t;
}
AttributeInstance.abstract({
	vftable:VoidPointer,
	u1:VoidPointer,
	u2:VoidPointer,
	currentValue: [float32_t, 0x84],
	minValue: [float32_t, 0x7C],
	maxValue: [float32_t, 0x80],
	defaultValue: [float32_t, 0x78],
});

export class BaseAttributeMap extends NativeClass
{
    getMutableInstance(type:AttributeId):AttributeInstance
    {
        throw 'abstract';
    }
}
BaseAttributeMap.abstract({});

BaseAttributeMap.prototype.getMutableInstance = makefunc.js(proc["BaseAttributeMap::getMutableInstance"], AttributeInstance, BaseAttributeMap, false, RawTypeId.Int32);

