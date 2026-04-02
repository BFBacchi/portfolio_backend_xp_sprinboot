import React from "react";
import Icon from "./icon/Icon";
import myComputerIcon from "../../assets/mycomputer.png";
import recycleBinIcon from "../../assets/recyclebin.png";

const IconList = ({
  desktopRef,
  positions,
  onPositionChange,
  onOpenWindow,
  onIconContextMenu,
}) => {
  return (
    <>
      <Icon
        id="myComputer"
        name="Mi PC"
        image={myComputerIcon}
        left={positions.myComputer.x}
        top={positions.myComputer.y}
        desktopRef={desktopRef}
        onPositionChange={onPositionChange}
        onOpen={() => onOpenWindow("myComputer")}
        onRequestContextMenu={onIconContextMenu}
      />
      <Icon
        id="recycleBin"
        name="Papelera"
        image={recycleBinIcon}
        left={positions.recycleBin.x}
        top={positions.recycleBin.y}
        desktopRef={desktopRef}
        onPositionChange={onPositionChange}
        onOpen={() => onOpenWindow("recycleBin")}
        onRequestContextMenu={onIconContextMenu}
      />
    </>
  );
};

export default IconList;
