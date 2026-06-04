from pydantic import BaseModel


class BackpackListRequest(BaseModel):
    player_id: int


class BackpackItemActionRequest(BaseModel):
    player_id: int
    item_id: int


class ItemDTO(BaseModel):
    item_id: int
    item_name: str
    item_size: int
    item_value: int


class BackpackResponse(BaseModel):
    backpack_id: int
    backpack_size: int
    items: list[ItemDTO] = []